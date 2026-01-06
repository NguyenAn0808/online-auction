import api from "./api";

/**
 * Category Service - Handles all category-related API calls
 */
export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<{success: boolean, data: Array, count: number}>}
   */
  getCategories: async () => {
    try {
      const response = await api.get("/api/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  },

  /**
   * Get category by ID
   * @param {string} id - Category UUID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  },

  /**
   * Create new category (admin only)
   * @param {Object} categoryData - {name: string, parent_id?: string}
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/api/categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create category"
      );
    }
  },

  /**
   * Update category (admin only)
   * @param {string} id - Category UUID
   * @param {Object} categoryData - {name?: string, parent_id?: string}
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/api/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to update category"
      );
    }
  },

  /**
   * Delete category (admin only)
   * @param {string} id - Category UUID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  },

  /**
   * Helper: Get parent categories only (categories with no parent_id)
   * @returns {Promise<Array>}
   */
  getParentCategories: async () => {
    try {
      const response = await categoryService.getCategories();
      if (!response.success || !response.data) {
        return [];
      }
      return response.data.filter((cat) => cat.parent_id === null);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
      throw error;
    }
  },

  /**
   * Helper: Get child categories for a specific parent
   * @param {string} parentId - Parent category UUID
   * @returns {Promise<Array>}
   */
  getChildCategories: async (parentId) => {
    try {
      const response = await categoryService.getCategories();
      if (!response.success || !response.data) {
        return [];
      }
      return response.data.filter((cat) => cat.parent_id === parentId);
    } catch (error) {
      console.error(`Error fetching child categories for ${parentId}:`, error);
      throw error;
    }
  },

  /**
   * Helper: Get category hierarchy (parents with their children)
   * @returns {Promise<Array>} Array of parent categories with children property
   */
  getCategoryHierarchy: async () => {
    try {
      const response = await categoryService.getCategories();
      if (!response.success || !response.data) {
        return [];
      }

      const allCategories = response.data;
      const parents = allCategories.filter((cat) => cat.parent_id === null);

      return parents.map((parent) => ({
        ...parent,
        children: allCategories.filter((cat) => cat.parent_id === parent.id),
      }));
    } catch (error) {
      console.error("Error fetching category hierarchy:", error);
      throw error;
    }
  },
};

export default categoryService;
