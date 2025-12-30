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
      console.log(`[ratingService] Calling GET /api/ratings/${userId}`);
      const response = await api.get(`/api/ratings/${userId}`);
      console.log("[ratingService] Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ratingService] Error fetching user ratings:", error);
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
      console.log("[ratingService] Calling POST /api/ratings with:", data);
      const response = await api.post(`/api/ratings`, data);
      console.log("[ratingService] Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[ratingService] Error creating rating:", error);
      throw error;
    }
  },

  /**
   * Get user rating percentage and eligibility
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} { rating_percentage, can_bid, total_ratings, positive_ratings, negative_ratings }
   */
  getUserRatingEligibility: async (userId) => {
    try {
      console.log(`[ratingService] Calling GET /api/ratings/${userId}/eligibility`);
      const response = await api.get(`/api/ratings/${userId}/eligibility`);
      console.log("[ratingService] Eligibility response:", response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("[ratingService] Error checking rating eligibility:", error);
      throw error;
    }
  },
};

export default ratingService;
