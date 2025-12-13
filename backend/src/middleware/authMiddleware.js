import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/settings.js";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    jwt.verify(token, config.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Find user in PostgreSQL
      const user = await User.findById(decodedUser.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request (without password - User.findById already excludes it)
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      };
      next();
    });
  } catch (error) {
    console.error("Authentication error in middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Authorization Middleware - Role-based Access Control (RBAC)
 * Usage: authorize('admin'), authorize('admin', 'seller'), etc.
 *
 * Roles:
 * - guest: No authentication needed (public routes)
 * - bidder: Can view and bid on auctions
 * - seller: Can create and manage their own auctions + bid
 * - admin: Full access to everything
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Export combined middleware for protected routes
export const protectedRoute = authenticate;
