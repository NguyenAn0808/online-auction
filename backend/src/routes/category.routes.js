import express from "express";
import CategoryController from "../controllers/category.controller.js";

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories (all roles can use)
 * @access  Public
 */
router.get("/", CategoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get("/:id", CategoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create new category (only admin, seller can use)
 * @access  Protected - TODO: Add auth middleware
 */
router.post("/", CategoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Protected - TODO: Add auth middleware
 */
router.put("/:id", CategoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Protected - TODO: Add auth middleware
 */
router.delete("/:id", CategoryController.deleteCategory);

export default router;
