import express from "express";
import {
  // changePassword,
  // forgotPassword,
  // refreshToken,
  // resetPassword,
  // signIn,
  // signOut,
  signUp,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/signup", signUp);

// router.post("/signin", signIn);

// router.post("/signout", signOut);

// router.post("/changepassword", changePassword);

// router.post("/forgotpassword", forgotPassword);

// router.post("/resetpassword", resetPassword);

// router.post("/refresh", refreshToken);

export default router;
