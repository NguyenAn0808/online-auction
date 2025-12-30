import api from "./api";

/**
 * Order Service - Handles order-related API calls following OpenAPI specification
 * Source of Truth: openapi.yaml
 *
 * Order Status Enums (from OpenAPI):
 * - PendingBidderPayment
 * - PendingSellerConfirmation
 * - PendingDelivery
 * - PendingRating
 * - Completed
 * - Cancelled
 */

/**
 * Get order details by product ID
 * @param {string} productId - Product UUID
 * @returns {Promise<Object>} Order details
 */
export const getOrder = async (productId) => {
  try {
    const response = await api.get(`/api/products/${productId}/order`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

/**
 * List all orders for the logged-in user
 * @param {string} role - Optional: 'seller' to filter by seller role
 * @returns {Promise<Array>} Array of orders
 */
export const listOrders = async (role = null) => {
  try {
    const params = role ? { role } : {};
    const response = await api.get(`/api/orders`, { params });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Submit payment proof and shipping address (Buyer)
 * POST /orders/{order_id}/payment-proof
 * @param {string} orderId - Order UUID
 * @param {Object} paymentData - { shippingAddress: string, paymentProofUrl: string }
 * @returns {Promise<Object>} Updated order
 *
 * NOTE: OpenAPI spec expects paymentProofUrl as a URL string.
 * If you have File objects, you need to upload them first to get URLs.
 * Alternatively, the backend may accept multipart/form-data (check backend implementation).
 */
export const submitPayment = async (orderId, paymentData) => {
  try {
    const response = await api.post(
      `/api/orders/${orderId}/payment-proof`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting payment:", error);
    throw error;
  }
};

/**
 * Submit shipment proof (Seller)
 * POST /orders/{order_id}/shipment-proof
 * @param {string} orderId - Order UUID
 * @param {Object} shipmentData - { shippingProofUrl: string }
 * @returns {Promise<Object>} Updated order
 *
 * NOTE: OpenAPI spec expects shippingProofUrl as a URL string.
 * If you have File objects, you need to upload them first to get URLs.
 */
export const submitShipment = async (orderId, shipmentData) => {
  try {
    const response = await api.post(
      `/api/orders/${orderId}/shipment-proof`,
      shipmentData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting shipment:", error);
    throw error;
  }
};

/**
 * Confirm delivery (Buyer)
 * POST /orders/{order_id}/delivery-confirmation
 * @param {string} orderId - Order UUID
 * @returns {Promise<Object>} Updated order
 */
export const confirmDelivery = async (orderId) => {
  try {
    const response = await api.post(
      `/api/orders/${orderId}/delivery-confirmation`
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming delivery:", error);
    throw error;
  }
};

/**
 * Cancel order (Seller)
 * POST /orders/{order_id}/cancel
 * @param {string} orderId - Order UUID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`/api/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

/**
 * Get messages for an order
 * @param {string} orderId - Order UUID
 * @returns {Promise<Array>} Array of messages
 */
export const getOrderMessages = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}/messages`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching order messages:", error);
    throw error;
  }
};

/**
 * Send a message in order chat
 * @param {string} orderId - Order UUID
 * @param {string} message - Message text
 * @returns {Promise<Object>} Created message
 */
export const sendOrderMessage = async (orderId, message) => {
  try {
    const response = await api.post(`/api/orders/${orderId}/messages`, {
      message,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Order Status Constants (from OpenAPI spec)
 * Use these instead of database status strings
 */
export const ORDER_STATUS = {
  PENDING_BIDDER_PAYMENT: "PendingBidderPayment",
  PENDING_SELLER_CONFIRMATION: "PendingSellerConfirmation",
  PENDING_DELIVERY: "PendingDelivery",
  PENDING_RATING: "PendingRating",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/**
 * Get all won items (auctions the user has won)
 * GET /api/orders/won
 * @returns {Promise<Array>} Array of won orders
 */
export const getWonItems = async () => {
  try {
    const response = await api.get(`/api/orders/won`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching won items:", error);
    throw error;
  }
};

export default {
  getOrder,
  listOrders,
  getWonItems,
  submitPayment,
  submitShipment,
  confirmDelivery,
  cancelOrder,
  getOrderMessages,
  sendOrderMessage,
  ORDER_STATUS,
};
