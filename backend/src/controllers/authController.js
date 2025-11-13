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

    // Create access token and JWT
    const accessToken = jwt.sign(
      { user_id: user.id },
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
      secure: true,
      sameSite: "none", //backend, frontend deploy separately
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res
      .status(200)
      .json({ message: `User ${user.fullName} logged in successfully.` });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const signOut = async (req, res) => {};

// export const changePassword = async (req, res) => {};

// export const forgotPassword = async (req, res) => {};

// export const resetPassword = async (req, res) => {};

// export const refreshToken = async (req, res) => {};
