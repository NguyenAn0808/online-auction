import express from "express";
import {
  // changePassword,
  // forgotPassword,
  // refreshToken,
  // resetPassword,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       204:
 *         description: Login successful (No content)
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/signup", signUp);

/**
 * @openapi
 * /api/auth/signin:
 *   post:
 *     summary: Login with username and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignInResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/signin", signIn);

/**
 * @openapi
 * /api/auth/signout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignOutRequest'
 *     responses:
 *       204:
 *         description: Logout successful (No content)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/signout", signOut);

// router.post("/changepassword", changePassword);

// router.post("/forgotpassword", forgotPassword);

// router.post("/resetpassword", resetPassword);

// router.post("/refresh", refreshToken);

// router.post("/verifyOTP", verifyOTP);

// router.post("resendOTP", resendOTP);

export default router;
