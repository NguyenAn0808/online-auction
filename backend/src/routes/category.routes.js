import express from "express";
import CategoryController from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - anyone can view categories
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Protected routes - only admin can modify
router.post(
  "/",
  authenticate,
  authorize("admin"),
  CategoryController.createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  CategoryController.deleteCategory
);

export default router;
