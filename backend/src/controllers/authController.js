import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";

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
    const hashedPassword = await bycrypt.hash(password, 10); // salt = 10

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
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const signIn = async (req, res) => {};

// export const signOut = async (req, res) => {};

// export const changePassword = async (req, res) => {};

// export const forgotPassword = async (req, res) => {};

// export const resetPassword = async (req, res) => {};

// export const refreshToken = async (req, res) => {};
