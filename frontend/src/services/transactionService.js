import api from "./api";
/**
 * GET Single Transaction (Order) by ID
 */
export const getTransaction = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
};

/**
 * Step 1: Buyer Creates Order (Uploads Payment Proof)
 * @param {FormData} formData - Contains productId, shippingAddress, image
 */
export const createOrder = async (formData) => {
  const response = await api.post("./api/orders", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const confirmShipping = async (orderId, trackingCode, file) => {
  const formData = new FormData();
  formData.append("shippingCode", trackingCode);
  if (file) {
    formData.append("image", file);
  }

  // Use PATCH and correct endpoint
  const response = await api.patch(`/api/orders/${orderId}/shipment-proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data || response.data;
};

/**
 * Step 3: Buyer Confirms Receipt
 */
export const confirmReceipt = async (orderId) => {
  const response = await api.patch(`/api/orders/${orderId}/delivery-confirmation`);
  return response.data.data || response.data;
};

/**
 * Step 4: Rate Transaction
 */
export const rateTransaction = async (orderId, score, comment) => {
  const response = await api.post(`/api/orders/${orderId}/rate`, {
    score,
    comment,
  });
  return response.data;
};

/**
 * Seller Cancels Order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/api/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// Simple in-memory transaction service for UI/demo purposes.
let _transactions = [];
let _id = 1;

// DEPRECATED: Use ORDER_STATUS from orderService.js instead
// These constants are kept for backward compatibility but should be migrated to OpenAPI enums
export const STATUS = {
  // OpenAPI Status Enums (from orderService.ORDER_STATUS):
  PENDING_BIDDER_PAYMENT: "PendingBidderPayment",
  PENDING_SELLER_CONFIRMATION: "PendingSellerConfirmation",
  PENDING_DELIVERY: "PendingDelivery",
  PENDING_RATING: "PendingRating",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",

  // Legacy aliases for backward compatibility (deprecated)
  PENDING_BUYER: "PendingBidderPayment",
  WAITING_SELLER_CONFIRMATION: "PendingSellerConfirmation",
  IN_TRANSIT: "PendingDelivery",
  COMPLETED_AWAITING_RATING: "PendingRating",
  PAYMENT_REJECTED: "Cancelled",
};

export function resetStore() {
  _transactions = [];
}

export function seedDemo() {
  console.log("Seeding demo data (Mock only)");
}

export const listTransactions = async (role = "") => {
  // We can pass 'buyer' or 'seller' as a role filter if your backend supports it.
  // Based on your controller, GET /orders uses req.user.id to find related orders.

  const query = role ? `?role=${role}` : "";
  console.log("[transactionService] Calling GET /api/orders" + query);
  const response = await api.get(`/api/orders${query}`);
  console.log("[transactionService] Response:", response.data);

  // Return the array of orders.
  // We check response.data.data first (standard), then response.data (fallback)
  return response.data.data || response.data || [];
};

// Used by ChatBox.jsx
export function addMessage(id, message) {
  console.log("Chat not implemented in backend yet. Message:", message);
  // Return a fake transaction object to keep the UI happy
  return {
    id,
    messages: [{ id: Date.now(), ...message }],
  };
}

export function markMessagesRead(txId, userId) {
  return null;
}

export function getUnreadCount(userId) {
  return 0;
}

export function createTransaction(data) {
  console.warn("Use createOrder() instead of createTransaction()");
  return {};
}

export function notifyWinner(id) {
  return {};
}

export function markWinner(id) {
  return {};
}

// Helper for SellerTransactions if it uses synchronous update
export function updateTransaction(id, patch) {
  console.warn("Use confirmShipping() or confirmReceipt() instead.");
  return null;
}
