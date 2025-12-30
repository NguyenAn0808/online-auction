import api from "./api";

/**
 * Win List service - handles won products API calls
 */
export const winListService = {
  /**
   * Get won products for the current user
   * GET /api/orders/won - returns orders where user is the winner/buyer
   * @returns {Promise<Array>} Array of won orders with product details
   */
  getWinList: async () => {
    try {
      console.log("[winListService] Calling GET /api/orders/won");
      const response = await api.get(`/api/orders/won`);
      console.log("[winListService] Response:", response.data);
      // Handle backend response format: { success: true, data: [...] } or direct array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("[winListService] Error fetching win list:", error);
      throw error;
    }
  },
};

export default winListService;

