import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import config from "./settings.js";

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const fullName = profile.displayName;
          const googleId = profile.id;

          // Check if user exists
          let user = await User.findByEmail(email);

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              await User.updateSocialId(user.id, "google", googleId);
              user.googleId = googleId;
            }
            if (!user.isVerified) {
              await User.updateVerificationStatus(user.id, true);
              user.isVerified = true;
            }
            return done(null, user);
          }

          // Create new user
          const username = email.split("@")[0] + "_" + Date.now();
          user = await User.createSocialUser({
            username,
            email,
            fullName,
            googleId,
            role: "bidder",
            isVerified: true, // Email already verified by Google
          });

          return done(null, user);
        } catch (error) {
          console.error("Error in Google OAuth:", error);
          return done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (config.FACEBOOK_APP_ID && config.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.FACEBOOK_APP_ID,
        clientSecret: config.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:8000/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const fullName = profile.displayName;
          const facebookId = profile.id;

          if (!email) {
            return done(
              new Error("Facebook account must have an email address"),
              null
            );
          }

          // Check if user exists
          let user = await User.findByEmail(email);

          if (user) {
            // Update Facebook ID if not set
            if (!user.facebookId) {
              await User.updateSocialId(user.id, "facebook", facebookId);
              user.facebookId = facebookId;
            }
            return done(null, user);
          }

          // Create new user
          const username = email.split("@")[0] + "_" + Date.now();
          user = await User.createSocialUser({
            username,
            email,
            fullName,
            facebookId,
            role: "bidder",
            isVerified: true, // Email already verified by Facebook
          });

          return done(null, user);
        } catch (error) {
          console.error("Error in Facebook OAuth:", error);
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
