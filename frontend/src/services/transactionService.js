import api from "./api";
/**
 * GET Single Transaction (Order) by ID
 */
export const getTransaction = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
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
  const response = await api.post("/orders", formData, {
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

  // CHANGE THIS TO api.patch
  const response = await api.patch(`/orders/${orderId}/ship`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data;
};

/**
 * Step 3: Buyer Confirms Receipt
 */
export const confirmReceipt = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/receive`);
  return response.data;
};

/**
 * Step 4: Rate Transaction
 */
export const rateTransaction = async (orderId, score, comment) => {
  const response = await api.post(`/orders/${orderId}/rate`, {
    score,
    comment,
  });
  return response.data;
};

/**
 * Seller Cancels Order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// Simple in-memory transaction service for UI/demo purposes.
let _transactions = [];
let _id = 1;

export const STATUS = {
  PENDING_BUYER: "pending_verification", // Was 'PENDING_BUYER'
  WAITING_SELLER_CONFIRMATION: "pending_verification",
  IN_TRANSIT: "delivering",
  COMPLETED_AWAITING_RATING: "await_rating",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PAYMENT_REJECTED: "cancelled",
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
  const response = await api.get(`/orders${query}`);

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
