import api from "./api";

export const watchlistService = {
  // Get the current user's watchlist
  getWatchlist: async (userId) => {
    try {
      const res = await api.get(`/watchlist`, { params: { user_id: userId } });
      return res.data;
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      throw error;
    }
  },

  // Add a product to watchlist
  addToWatchlist: async (userId, productId) => {
    try {
      const res = await api.post(`/watchlist`, {
        user_id: userId,
        product_id: productId,
      });
      return res.data;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  },

  // Remove a product from watchlist
  removeFromWatchlist: async (userId, productId) => {
    try {
      const res = await api.delete(`/watchlist/${userId}/${productId}`);
      return res.data;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  },
};
