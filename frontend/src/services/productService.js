import api from "./api";

export const productService = {
  // Get top 5 products nearing end time
  getTopEndingProducts: async () => {
    try {
      const response = await api.get("/products/top-ending");
      return response.data;
    } catch (error) {
      console.error("Error fetching top ending products:", error);
      throw error;
    }
  },

  // Get top 5 products with highest bids
  getTopBidProducts: async () => {
    try {
      const response = await api.get("/products/top-bid");
      return response.data;
    } catch (error) {
      console.error("Error fetching top bid products:", error);
      throw error;
    }
  },

  // Get top 5 products with highest price
  getTopPriceProducts: async () => {
    try {
      const response = await api.get("/products/top-price");
      return response.data;
    } catch (error) {
      console.error("Error fetching top price products:", error);
      throw error;
    }
  },

  // Get all products with filters
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
};
