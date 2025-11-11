import CategoryService from "../services/category.service.js";

/**
 * Category Controller - HTTP request handlers
 */
class CategoryController {
  /**
   * GET /categories
   * Get all categories
   */
  static async getAllCategories(req, res) {
    try {
      const result = await CategoryService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count,
      });
    } catch (error) {
      console.error("Error in getAllCategories:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * GET /categories/:id
   * Get category by ID
   */
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.getCategoryById(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * POST /categories
   * Create new category
   */
  static async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const result = await CategoryService.createCategory(categoryData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in createCategory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * PUT /categories/:id
   * Update category
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await CategoryService.updateCategory(id, categoryData);

      if (!result.success) {
        const statusCode = result.message === "Category not found" ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in updateCategory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /categories/:id
   * Delete category
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default CategoryController;
