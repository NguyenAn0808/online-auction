import api from "./api";

/**
 * Win List service - handles won products API calls
 */
export const winListService = {
  /**
   * Get won products for the current user
   * @returns {Promise<Array>} Array of won products
   */
  getWinList: async () => {
    try {
      const response = await api.get(`/api/win-list`);
      // Handle backend response format: { success: true, data: [...] } or direct array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching win list:", error);
      throw error;
    }
  },
};

export default winListService;

