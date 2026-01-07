import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateRole,
  updateUser,
  adminResetPassword,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes - no authentication required
// Get specific user (for viewing seller profiles)
router.get("/:id", getUserById);

// Protected routes - authentication required
router.use(authenticate);

router.get("/", authorize("admin"), getAllUsers);

// Create new user (Admin manual creation)
router.post("/", authorize("admin"), createUser);

// Update user role
router.patch("/:id/role", authorize("admin"), updateRole);

// Admin reset user password
router.post("/:id/reset-password", authorize("admin"), adminResetPassword);

// Delete user
router.delete("/:id", authorize("admin"), deleteUser);

// Update specific user details (user must be authenticated)
router.put("/:id", updateUser);

export default router;
