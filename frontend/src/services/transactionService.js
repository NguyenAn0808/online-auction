// Simple in-memory transaction service for UI/demo purposes.
let _transactions = [];
let _id = 1;

export const STATUS = {
  PENDING_BUYER: "PENDING_BUYER",
  WAITING_SELLER_CONFIRMATION: "WAITING_SELLER_CONFIRMATION",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  IN_TRANSIT: "IN_TRANSIT",
  COMPLETED_AWAITING_RATING: "COMPLETED_AWAITING_RATING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export function resetStore() {
  _transactions = [];
  _id = 1;
}

export function createTransaction({
  buyerId,
  sellerId,
  paymentInvoice,
  deliveryAddress,
}) {
  const tx = {
    id: String(_id++),
    buyerId,
    sellerId,
    status: STATUS.WAITING_SELLER_CONFIRMATION,
    paymentInvoice: paymentInvoice || null,
    shippingInvoice: null,
    deliveryAddress: deliveryAddress || null,
    ratings: { buyer: null, seller: null },
    messages: [],
    // per-user last read timestamp to compute unread counts
    lastReadAt: {},
    createdAt: Date.now(),
  };
  _transactions.unshift(tx);
  return tx;
}

export function listTransactions(filter = () => true) {
  return _transactions.filter(filter);
}

export function getTransaction(id) {
  return _transactions.find((t) => t.id === String(id)) || null;
}

export function updateTransaction(id, patch) {
  const tx = getTransaction(id);
  if (!tx) return null;
  Object.assign(tx, patch);
  return tx;
}

export function addMessage(id, message) {
  const tx = getTransaction(id);
  if (!tx) return null;
  const msg = { id: Date.now(), ...message };
  // allow attachments array on message (files represented as {name,url})
  if (message.attachments && !Array.isArray(message.attachments)) {
    msg.attachments = [message.attachments];
  }
  tx.messages.push(msg);
  return tx;
}

export function markMessagesRead(txId, userId) {
  const tx = getTransaction(txId);
  if (!tx) return null;
  tx.lastReadAt = tx.lastReadAt || {};
  tx.lastReadAt[userId] = Date.now();
  return tx;
}

export function getUnreadCount(userId) {
  let count = 0;
  _transactions.forEach((tx) => {
    const last = (tx.lastReadAt && tx.lastReadAt[userId]) || 0;
    const newMsgs = tx.messages.filter((m) => m.time && m.time > last);
    // only count messages not authored by the user
    const unread = newMsgs.filter((m) => m.sender !== userId).length;
    count += unread;
  });
  return count;
}

export function notifyWinner(id) {
  const tx = getTransaction(id);
  if (!tx) return null;
  // Seller sends initial winning message to the buyer
  const sellerMessage = {
    sender: tx.sellerId,
    text: `Congratulations! You won the auction for transaction ${tx.id}. Please follow up here to arrange payment and delivery.`,
    time: Date.now(),
  };
  tx.messages.push({ id: Date.now() + 1, ...sellerMessage });
  return tx;
}

export function markWinner(id) {
  const tx = getTransaction(id);
  if (!tx) return null;
  // ensure transaction exists and mark waiting seller confirmation
  tx.status = STATUS.WAITING_SELLER_CONFIRMATION;
  notifyWinner(id);
  return tx;
}

// convenience to seed demo data
export function seedDemo() {
  resetStore();

  // Demo transaction for Zip Tote Basket - ended auction
  // Winner: buyer-1 (Lisa Wong), Seller: seller-1
  const zipToteTx = {
    id: "tx-ziptote",
    productId: "prod-1",
    productName: "Zip Tote Basket",
    productImage:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg",
    winningBid: 275.0,
    buyerId: "buyer-1",
    buyerName: "Lisa Wong",
    sellerId: "seller-1",
    sellerName: "Seller Co.",
    status: STATUS.PENDING_BUYER,
    paymentInvoice: null,
    shippingInvoice: null,
    deliveryAddress: null,
    ratings: { buyer: null, seller: null },
    messages: [
      {
        id: 1,
        sender: "seller-1",
        senderName: "Seller Co.",
        text: "Congratulations! You won the auction for the Zip Tote Basket at $275.00. Please complete your payment and shipping details to proceed.",
        time: Date.now() - 3600000, // 1 hour ago
      },
    ],
    lastReadAt: {},
    createdAt: Date.now() - 3600000,
  };
  _transactions.push(zipToteTx);

  // Keep existing demo transactions
  createTransaction({
    buyerId: "buyer-2",
    sellerId: "seller-1",
    paymentInvoice: {
      method: "Bank Transfer",
      reference: "ABC123",
      uploaded: null,
    },
    deliveryAddress: {
      name: "John Doe",
      line1: "123 Main St",
      city: "Townsville",
      zip: "12345",
    },
  });
  createTransaction({
    buyerId: "buyer-3",
    sellerId: "seller-1",
    paymentInvoice: { method: "PayPal", reference: "PP-9876", uploaded: null },
    deliveryAddress: {
      name: "Jane Smith",
      line1: "456 Oak Ave",
      city: "Cityplace",
      zip: "67890",
    },
  });
}
