import api from "./api";

/**
 * Product API - Backend API integration
 */
export const productAPI = {
  /**
   * Get all products with filters
   * @param {Object} params - Query parameters
   * @param {string} params.category_id - Filter by category UUID
   * @param {string} params.search - Search term
   * @param {boolean} params.end_time_desc - Sort by closest ending
   * @param {boolean} params.price_asc - Sort by price (low to high)
   * @param {boolean} params.price_desc - Sort by price (high to low)
   * @param {boolean} params.bid_amount_asc - Sort by bid (asc)
   * @param {boolean} params.bid_amount_desc - Sort by bid (desc)
   * @param {boolean} params.new_only - Only products from last 60 minutes
   * @param {string} params.status - Filter by status (active, ended)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @returns {Promise<{success: boolean, items: Array, pagination: Object}>}
   */
  getProducts: async (params = {}) => {
    try {
      const response = await api.get("/api/products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  },

  /**
   * Get product by ID with images
   * @param {string} id - Product UUID
   * @returns {Promise<Object>} - Product data with images array
   */
  getProductById: async (id) => {
    try {
      // Fetch product details and images in parallel
      const [productResponse, imagesResponse] = await Promise.all([
        api.get(`/api/products/${id}`),
        api
          .get(`/api/products/${id}/images`)
          .catch(() => ({ data: { data: [] } })),
      ]);

      const product = productResponse.data?.data || productResponse.data;
      const images = imagesResponse.data?.data || [];

      // Combine product with images
      return {
        ...product,
        images: images,
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  },

  /**
   * Get product images by product ID
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>} - Array of images
   */
  getProductImages: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/images`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching images for product ${productId}:`, error);
      return [];
    }
  },

  /**
   * Create product
   * @param {Object} productData - Product data
   * @returns {Promise<{success: boolean, data: Object, message: string}>}
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post("/api/products", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create product"
      );
    }
  },

  /**
   * Update product
   * @param {string} id - Product UUID
   * @param {Object} productData - Product data to update
   * @returns {Promise<Object>}
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to update product"
      );
    }
  },

  /**
   * Delete product
   * @param {string} id - Product UUID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  },

  /**
   * Get product images
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>}
   */
  getProductImages: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/images`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching images for product ${productId}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch product images"
      );
    }
  },

  /**
   * Add single product image
   * @param {string} productId - Product UUID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>}
   */
  addProductImage: async (productId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await api.post(
        `/api/products/${productId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading image for product ${productId}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to upload product image"
      );
    }
  },

  /**
   * Upload multiple product images
   * @param {string} productId - Product UUID
   * @param {File[]} imageFiles - Array of image files
   * @returns {Promise<Object>}
   */
  uploadProductImages: async (productId, imageFiles) => {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post(
        `/api/products/${productId}/images/bulk`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.warn(
        "Bulk upload failed or not implemented, trying sequential upload..."
      );
      const results = [];
      for (const file of imageFiles) {
        results.push(await productAPI.addProductImage(productId, file));
      }
      return { success: true, count: results.length };
    }
  },

  /**
   * Reject bidder (seller only, requires authentication)
   * @param {string} productId - Product UUID
   * @param {string} bidderId - Bidder UUID
   * @returns {Promise<Object>}
   */
  rejectBidder: async (productId, bidderId) => {
    try {
      const response = await api.post(
        `/api/products/${productId}/deny-bidder`,
        {
          bidder_id: bidderId,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error rejecting bidder ${bidderId} for product ${productId}:`,
        error
      );
      throw new Error(
        error.response?.data?.message || "Failed to reject bidder"
      );
    }
  },
};

/**
 * Product Helpers - Common query patterns
 */
export const productHelpers = {
  /**
   * Get top products nearing end time
   * @param {number} limit - Number of products to fetch (default: 5)
   * @returns {Promise<Array>}
   */
  getTopEndingProducts: async (limit = 5) => {
    try {
      const response = await productAPI.getProducts({
        end_time_desc: true,
        limit,
        page: 1,
      });
      return response.items || [];
    } catch (error) {
      console.error("Error fetching top ending products:", error);
      return [];
    }
  },

  /**
   * Get products with most bids
   * Note: Backend doesn't currently support sorting by bid count
   * This returns newest products as a fallback
   * @param {number} limit - Number of products to fetch (default: 5)
   * @returns {Promise<Array>}
   */
  getTopBidProducts: async (limit = 5) => {
    try {
      const response = await productAPI.getProducts({
        // Fallback or todo: bid_count sorting
        bid_amount_desc: true,
        limit,
        page: 1,
      });
      return response.items || [];
    } catch (error) {
      console.error("Error fetching top bid products:", error);
      return [];
    }
  },

  /**
   * Get products with highest price
   * @param {number} limit - Number of products to fetch (default: 5)
   * @returns {Promise<Array>}
   */
  getTopPriceProducts: async (limit = 5) => {
    try {
      const response = await productAPI.getProducts({
        price_desc: true,
        limit,
        page: 1,
      });
      return response.items || [];
    } catch (error) {
      console.error("Error fetching top price products:", error);
      return [];
    }
  },

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  searchProducts: async (searchTerm, page = 1, limit = 10) => {
    try {
      return await productAPI.getProducts({
        search: searchTerm,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error searching products:", error);
      return { items: [], pagination: { page, limit, total: 0 } };
    }
  },

  /**
   * Get products by category
   * @param {string} categoryId - Category UUID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  getProductsByCategory: async (categoryId, page = 1, limit = 10) => {
    try {
      return await productAPI.getProducts({
        category_id: categoryId,
        page,
        limit,
      });
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      return { items: [], pagination: { page, limit, total: 0 } };
    }
  },

  /**
   * Get new products (posted in last 60 minutes)
   * @param {number} limit - Number of products to fetch (default: 10)
   * @returns {Promise<Array>}
   */
  getNewProducts: async (limit = 10) => {
    try {
      const response = await productAPI.getProducts({
        new_only: true,
        limit,
        page: 1,
      });
      return response.items || [];
    } catch (error) {
      console.error("Error fetching new products:", error);
      return [];
    }
  },

  /**
   * Get related products
   * @param {string} categoryId - Category UUID
   * @param {string} currentProductId - ID to exclude
   * @returns {Promise<Array>}
   */
  getRelatedProducts: async (categoryId, currentProductId, limit = 5) => {
    try {
      const response = await productAPI.getProducts({
        category_id: categoryId,
        limit: limit + 1, // Fetch extra one to filter out current
        page: 1,
      });
      const items = response.items || [];
      return items.filter((p) => p.id !== currentProductId).slice(0, limit);
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },

  // --- COMPATIBILITY METHODS FOR LEGACY COMPONENTS ---

  getSimilarProducts: async (categoryId = null) => {
    // If we have a categoryId, try to fetch related, else empty
    if (categoryId)
      return productHelpers.getRelatedProducts(categoryId, null, 4);
    return [];
  },

  /**
   * Get bid history for a product
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>} - Array of bids
   */
  getBidHistory: async (productId) => {
    if (!productId) return [];
    try {
      const response = await api.get(`/api/bids`, {
        params: { product_id: productId },
      });
      const bids = response.data?.data || [];
      // Map to expected format for BidHistory component
      return bids.map((bid) => ({
        id: bid.id,
        bidder_id: bid.bidder_id,
        amount: Number(bid.amount),
        timestamp: bid.timestamp,
        status: bid.status || "pending",
        name: bid.bidder_name || "Anonymous Bidder",
      }));
    } catch (error) {
      console.error("Error fetching bid history:", error);
      return [];
    }
  },

  getQuestions: async (productId) => {
    // Placeholder: Backend does not expose questions yet
    return [];
  },

  addQuestion: async (questionData) => {
    // Placeholder: Backend does not expose questions yet
    console.log("Adding question:", questionData);
    return null;
  },

  // Deprecated method called 'getProduct' - map to getProductById or generic
  getProduct: () => {
    // This was a synchronous mock getter. Returning null now.
    return null;
  },
};

/**
 * Combined Product Service - Exports all product-related functions
 */
export const productService = {
  ...productAPI,
  ...productHelpers,
};

export default productService;
