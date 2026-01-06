import api from "./api";

/**
 * Bid service - handles bid-related API calls
 * Auto-bid system: Users set max_bid, system bids automatically
 */
export const bidService = {
  /**
   * Get bids for a product
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>} List of bids
   */
  getProductBids: async (productId) => {
    console.log(`[bidService] Calling GET /api/bids?product_id=${productId}`);
    const response = await api.get(`/api/bids?product_id=${productId}`);
    console.log("[bidService] Response:", response.data);
    return response.data;
  },

  /**
   * Place an auto-bid on a product
   * Auto-bid system: Set max_bid, system bids just enough to win
   * @param {Object} data - Bid data { product_id, max_bid }
   * @returns {Promise<Object>} Created/updated bid with competition result
   */
  placeBid: async (data) => {
    console.log("[bidService] Calling POST /api/bids with:", data);
    const response = await api.post(`/api/bids`, data);
    console.log("[bidService] Response:", response.data);
    return response.data;
  },

  /**
   * Accept a bid (seller only)
   * @param {string} bidId - Bid UUID
   * @returns {Promise<Object>} Updated bid
   */
  acceptBid: async (bidId) => {
    const response = await api.patch(`/api/bids/${bidId}/accept`);
    return response.data;
  },

  /**
   * Reject a bid and block bidder from this product (seller only)
   * @param {string} bidId - Bid UUID
   * @returns {Promise<Object>} Updated bid with block info
   */
  rejectBid: async (bidId) => {
    const response = await api.patch(`/api/bids/${bidId}/reject`);
    return response.data;
  },

  /**
   * Get blocklist for a product (seller only)
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>} List of blocked bidders
   */
  getProductBlocklist: async (productId) => {
    const response = await api.get(`/api/bids/${productId}/blocklist`);
    return response.data;
  },

  /**
   * Unblock a bidder for a product (seller only)
   * @param {string} productId - Product UUID
   * @param {string} bidderId - Bidder UUID to unblock
   * @returns {Promise<Object>} Confirmation
   */
  unblockBidder: async (productId, bidderId) => {
    const response = await api.delete(
      `/api/bids/${productId}/blocklist/${bidderId}`
    );
    return response.data;
  },
};
