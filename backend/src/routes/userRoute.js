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

// Get specific user
router.get("/:id", getUserById);

// Update specific user details
router.put("/:id", updateUser);

export default router;
