import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";
import config from "../config/settings.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 days

export const signUp = async (req, res) => {
  try {
    const { username, password, email, fullName, phone, address, birthdate } =
      req.body;

    // Validation
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user exists
    const duplicate_username = await User.findByUsername(username);
    const duplicate_email = await User.findByEmail(email);

    if (duplicate_username) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }

    if (duplicate_email) {
      return res.status(409).json({
        success: false,
        message: "Email already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // Create user
    await User.create({
      username,
      hashedPassword,
      email,
      phone,
      fullName,
      address,
      birthdate,
      role: "bidder", // Default role for new users
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    // Get input
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing username or password",
      });
    }

    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Create access token (JWT)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
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
          username: user.username,
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

    if (token) {
      // Delete session from Session
      await Session.deleteByRefreshToken(token);

      res.clearCookie("refreshToken");
    }

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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get current and new passwords from request body
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing current or new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Fetch user from DB
    const user = await User.findByUsername(req.user.username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await User.updatePassword(userId, hashedNewPassword);

    await Session.deleteAllByUserId(userId);

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

// export const forgotPassword = async (req, res) => {};

// export const resetPassword = async (req, res) => {};

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

    // Create new access token
    const accessToken = jwt.sign(
      {
        user_id: session.userId,
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
