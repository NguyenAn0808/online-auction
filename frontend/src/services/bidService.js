import api from "./api";

/**
 * Bid service - handles bid-related API calls
 */
export const bidService = {
  /**
   * Get bids for a product
   * @param {string} productId - Product UUID
   * @returns {Promise<Array>} List of bids
   */
  getProductBids: async (productId) => {
    const response = await api.get(`/api/bids/${productId}`);
    return response.data;
  },

  /**
   * Place a bid on a product (bidder only, seller cannot bid their own product)
   * @param {Object} data - Bid data { product_id, bid_amount }
   * @returns {Promise<Object>} Created bid
   */
  placeBid: async (data) => {
    const response = await api.post(`/api/bids`, data);
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
