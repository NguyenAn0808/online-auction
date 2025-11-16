import CategoryModel from "../models/category.model.js";

class CategoryService {
  // Get all categories
  static async getAllCategories() {
    try {
      const categories = await CategoryModel.findAll();
      return {
        success: true,
        data: categories,
        count: categories.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  // Get category by ID
  static async getCategoryById(id) {
    try {
      const category = await CategoryModel.findById(id);

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const { name, parent_id } = categoryData;

      // Validate required fields
      if (!name || name.trim() === "") {
        return {
          success: false,
          message: "Category name is required",
        };
      }

      // Check if category with same name already exists
      const exists = await CategoryModel.existsByName(name);
      if (exists) {
        return {
          success: false,
          message: "Category with this name already exists",
        };
      }

      // Validate parent category if parent_id is provided
      if (parent_id) {
        const parentCategory = await CategoryModel.findById(parent_id);
        if (!parentCategory) {
          return {
            success: false,
            message: "Parent category not found",
          };
        }
      }

      const category = await CategoryModel.create({
        name: name.trim(),
        parent_id: parent_id || null,
      });

      return {
        success: true,
        data: category,
        message: "Category created successfully",
      };
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  // Update category
  static async updateCategory(id, categoryData) {
    try {
      const { name, parent_id } = categoryData;

      // Check if category exists
      const existingCategory = await CategoryModel.findById(id);
      if (!existingCategory) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Prevent self-reference
      if (parent_id === id) {
        return {
          success: false,
          message: "Category cannot be its own parent",
        };
      }

      // Validate parent category if parent_id is provided
      if (parent_id) {
        const parentCategory = await CategoryModel.findById(parent_id);
        if (!parentCategory) {
          return {
            success: false,
            message: "Parent category not found",
          };
        }
      }

      const category = await CategoryModel.update(id, {
        name: name ? name.trim() : undefined,
        parent_id,
      });

      return {
        success: true,
        data: category,
        message: "Category updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  // Delete category
  static async deleteCategory(id) {
    try {
      const category = await CategoryModel.findById(id);

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      await CategoryModel.delete(id);

      return {
        success: true,
        message: "Category deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }
}

export default CategoryService;
