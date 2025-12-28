import api from "./api";

/**
 * Rating service - handles rating-related API calls
 */
export const ratingService = {
  /**
   * Get rating summary and history for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Rating summary with ratings array
   */
  getUserRatings: async (userId) => {
    try {
      const response = await api.get(`/api/ratings/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      throw error;
    }
  },

  /**
   * Create a rating for a user after auction completion
   * @param {Object} data - Rating data { user_id, reviewer_id, product_id, is_positive, comment }
   * @returns {Promise<Object>} Created rating
   */
  createRating: async (data) => {
    try {
      const response = await api.post(`/api/ratings`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  },
};

export default ratingService;

