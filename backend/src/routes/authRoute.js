import express from "express";
import passport from "passport";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  signIn,
  signOut,
  signUp,
  verifyOTP,
  resendOTP,
  googleOAuthCallback,
  facebookOAuthCallback,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

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
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignUpResponse'
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *             $ref: '#/components/schemas/Error'
 */
router.post("/signup", signUp);

/**
 * @openapi
 * /api/auth/signin:
 *   post:
 *     summary: Login with username and password
 *     tags: [Authentication]
 *     security:
 *       - SessionAuth: []
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
 *     security:
 *       - SessionAuth: []
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

/**
 * @openapi
 * /api/auth/change-password:
 *   patch:
 *     summary: Change password in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request (e.g., missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized or current password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
router.patch("/change-password", authenticate, changePassword);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: forgot password and enter email after that send reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordResponse'
 *       400:
 *         description: Bad request (e.g., missing email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User with the provided email not found
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
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *       400:
 *         description: Bad request (e.g., missing email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User with the provided email not found
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
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for signup
 *     description: Verify OTP code sent to user's email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VertifyOTPResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found (signup purpose only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/verify-otp", verifyOTP);

/**
 * @openapi
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendOTPResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User with the provided email not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.post("/resend-otp", resendOTP);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Create new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       204:
 *         description: Logout successful (No content)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *        description: Forbidden
 *        content:
 *         application/json:
 *          schema:
 *            $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", refreshToken);

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects user to Google OAuth consent screen
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles Google OAuth callback and creates/logs in user
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignInResponse'
 *       401:
 *         description: OAuth authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.status(500).json({
          success: false,
          message: "Authentication failed",
          error: err.message,
        });
      }

      if (!user) {
        console.error("No user returned from passport:", info);
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          info: info,
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  googleOAuthCallback
);

/**
 * @openapi
 * /api/auth/facebook:
 *   get:
 *     summary: Initiate Facebook OAuth login
 *     description: Redirects user to Facebook OAuth consent screen
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Facebook OAuth
 */
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

/**
 * @openapi
 * /api/auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     description: Handles Facebook OAuth callback and creates/logs in user
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Facebook
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignInResponse'
 *       401:
 *         description: OAuth authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.status(500).json({
          success: false,
          message: "Authentication failed",
          error: err.message,
        });
      }

      if (!user) {
        console.error("No user returned from passport:", info);
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          info: info,
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  facebookOAuthCallback
);

export default router;
