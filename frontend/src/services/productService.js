import api from "./api";

export const productService = {
  getTopEndingProducts: async () => {
    try {
      const response = await api.get("/products/top-ending");
      return response.data;
    } catch (error) {
      console.error("Error fetching top ending products:", error);
      throw error;
    }
  },

  getTopBidProducts: async () => {
    try {
      const response = await api.get("/products/top-bid");
      return response.data;
    } catch (error) {
      console.error("Error fetching top bid products:", error);
      throw error;
    }
  },

  getTopPriceProducts: async () => {
    try {
      const response = await api.get("/products/top-price");
      return response.data;
    } catch (error) {
      console.error("Error fetching top price products:", error);
      throw error;
    }
  },

  getProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get product detail
  getProductDetail: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, data) => {
    try {
      const response = await api.put(`/products/${productId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};
