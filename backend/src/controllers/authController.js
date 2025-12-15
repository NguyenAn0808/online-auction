import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";
import OTP from "../models/OTP.js";
import config from "../config/settings.js";
import { sendOTPEmail } from "../services/emailService.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 days
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_INTERVAL = 60 * 1000; // 1 minute

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const signUp = async (req, res) => {
  try {
    const { password, email, fullName, address, recaptchaToken } = req.body;

    // Validation
    if (!password || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (config.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);

      if (!recaptchaResult.success) {
        return res.status(400).json({
          success: false,
          message: recaptchaResult.error || "reCAPTCHA verification failed",
        });
      }

      console.log(
        `✅ reCAPTCHA verified - Score: ${recaptchaResult.score || "N/A"}`
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user exists
    const duplicate_email = await User.findByEmail(email);

    if (duplicate_email) {
      return res.status(409).json({
        success: false,
        message: "Email already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    let newUser;
    try {
      // Create user with is_verified = false
      newUser = await User.create({
        hashedPassword,
        email,
        fullName,
        address,
        role: "bidder",
        isVerified: false,
      });

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000); // 10 minutes from now

      // Delete any existing OTPs for this email
      await OTP.deleteByEmail(email, "signup");

      // Create new OTP
      await OTP.create(newUser.id, email, otpCode, "signup", expiresAt);

      // Send OTP email
      await sendOTPEmail(email, otpCode, fullName, "signup");

      return res.status(200).json({
        success: true,
        message: "OTP has been sent to your email",
        data: {
          email,
          expiresIn: `${OTP_EXPIRY_MINUTES} minutes`,
        },
      });
    } catch (signupError) {
      console.error("Error during signup process:", signupError);

      // Rollback: Delete the user if it was created
      if (newUser && newUser.id) {
        try {
          await User.deleteById(newUser.id);
          console.log(`Rolled back user creation for ${email}`);
        } catch (deleteError) {
          console.error("Error rolling back user creation:", deleteError);
        }
      }

      return res.status(500).json({
        success: false,
        message: "Failed to complete signup process. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in sendVerifyOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing email or OTP",
      });
    }

    // Find active OTP
    const otpRecord = await OTP.findActiveOTP(email, "signup");

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteByEmail(email, "signup");
    }

    if (otp !== otpRecord.otpCode) {
      await OTP.incrementAttempts(otpRecord.id);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsRemanining: MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1),
      });
    }

    await OTP.markAsVerified(otpRecord.id);

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user verification status
    const verifiedUser = await User.updateVerificationStatus(user.id, true);

    // Clean up OTPs after successful verification
    await OTP.deleteByEmail(email, "signup");

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to Online Auction!",
      data: {
        user: {
          id: verifiedUser.id,
          email: verifiedUser.email,
          fullName: verifiedUser.fullName,
          role: verifiedUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Error in sign in:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Prevent resending OTP too frequently (can resend only after interval)

    const recentOTP = await OTP.findRecentOTP(
      email,
      purpose,
      OTP_RESEND_INTERVAL
    );
    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: "OTP was sent recently. Please wait before requesting again.",
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete old OTP and create new one atomically
    await OTP.deleteByEmail(email, purpose);
    const newOTP = await OTP.create(
      user.id,
      email,
      otpCode,
      purpose,
      expiresAt
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.fullName, purpose);

      console.log(`✅ OTP resent successfully to ${email}`);

      return res.status(200).json({
        success: true,
        message: "A new OTP has been sent to your email",
        data: {
          email: email,
          expiresIn: `${OTP_EXPIRY_MINUTES} minutes`,
          purpose: purpose,
        },
      });
    } catch (emailError) {
      // If email fails, delete the OTP we just created to allow retry
      console.error("Error sending OTP email:", emailError);
      await OTP.deleteByEmail(email, purpose);

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in resend OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    // Get input
    const { login, password } = req.body; // Login by email

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
      });
    }

    const user = await User.findByEmail(login);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user's email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification code.",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create access token (JWT)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // Create refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create new session to store refresh token
    await Session.create({
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Return refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      success: true,
      message: `User ${user.fullName} logged in successfully`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signOut = async (req, res) => {
  try {
    // Get refresh token from cookies
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    // Verify the refresh token exists in database
    const session = await Session.findByRefreshToken(token);

    if (!session) {
      // Clear the invalid cookie
      res.clearCookie("refreshToken");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Delete session from database
    await Session.deleteByRefreshToken(token);

    // Clear the cookie
    res.clearCookie("refreshToken");

    console.log(`✅ User logged out successfully`);
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error in sign out:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    // User is authenticated via authMiddleware
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const dbPassword = user.hashedPassword;

    // Block OAuth users
    const isOAuthUser = !dbPassword || dbPassword === "";
    if (isOAuthUser) {
      return res.status(403).json({
        success: false,
        message:
          "Password changes are not available for social login accounts.",
      });
    }

    // Get current and new passwords from request body
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Verify current password
    const passwordCorrect = await bcrypt.compare(currentPassword, dbPassword);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await User.updatePassword(userId, hashedNewPassword);

    if (Session && Session.deleteAllByUserId) {
      await Session.deleteAllByUserId(userId);
    }

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again with your new password.",
    });
  } catch (error) {
    console.error("Error in change password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000); // 10 minutes from now

    // Delete any existing OTPs for this email
    await OTP.deleteByEmail(email, "password-reset");

    // Create new OTP
    await OTP.create(user.id, email, otpCode, "password-reset", expiresAt);

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.fullName, "password-reset");
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email",
      data: {
        email,
        expiresIn: `${OTP_EXPIRY_MINUTES} minutes`,
      },
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP code is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find the active OTP
    const otpRecord = await OTP.findActiveOTP(email, "password-reset");

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Check if OTP expired first
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteByEmail(email, "password-reset");
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Check max attempts before verifying
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteByEmail(email, "password-reset");
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP code
    if (otp.trim() !== otpRecord.otpCode) {
      await OTP.incrementAttempts(otpRecord.id);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
        attemptsRemaining: MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1),
      });
    }

    // Find user
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.hashedPassword
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the old password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user.id, hashedNewPassword);

    // Delete the OTP after successful password reset
    await OTP.deleteByEmail(email, "password-reset");

    // Delete all user sessions for security (force re-login)
    await Session.deleteAllByUserId(user.id);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Compare refresh token with sessions in DB
    const session = await Session.findByRefreshToken(token);

    if (!session) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Refresh token has expired" });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error in refresh token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Google OAuth callback handler
export const googleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "OAuth authentication failed",
      });
    }
    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create session
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
    await Session.create({ userId: user.id, refreshToken, expiresAt });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL,
    });

    const hasPassword = !!(
      user.hashedPassword && user.hashedPassword.length > 0
    );

    // Redirect to frontend with tokens in URL (will be removed after storing)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&user=${encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        hasPassword: hasPassword,
      })
    )}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Facebook OAuth callback handler
export const facebookOAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "OAuth authentication failed",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create session
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
    await Session.create({ userId: user.id, refreshToken, expiresAt });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // Redirect to frontend with tokens in URL (will be removed after storing)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&user=${encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      })
    )}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Facebook OAuth callback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
