import ProductModel from "../models/product.model.js";
import Bid from "../models/Bid.js";
import Order from "../models/Order.js";
import Rating from "../models/Rating.js";
import UploadService from "../services/upload.service.js";
import OrderMessage from "../models/OrderMessage.js";
import pool from "../config/database.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, shippingAddress } = req.body;
    const winnerBidder = await Bid.getHighest(productId);

    if (!winnerBidder) {
      return res.status(400).json({
        success: false,
        message: "No bids found. Cannot create order.",
      });
    }
    const winnerId = winnerBidder ? winnerBidder.bidder_id : req.user.id;
    // Validate input
    if (!productId || !shippingAddress || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Upload payment proof image to Supabase
    const uploadResult = await UploadService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: uploadResult.message || "Failed to upload payment proof image",
      });
    }

    const proofImage = uploadResult.url;

    // Check if product exists
    // const product = await ProductModel.findById(productId);
    // if (!product || product.status !== "ended") {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Product is not found or does not exist",
    //   });
    // }

    const order = await Order.create({
      productId,
      buyerId: winnerId,
      sellerId: (await ProductModel.findById(productId)).seller_id,
      finalPrice: winnerBidder.amount,
      proofImage: uploadResult.url,
      address: shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in create order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const confirmShipping = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;
    const { shippingCode } = req.body;

    if (!shippingCode || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing shippingCode or shippingImage",
      });
    }

    // Upload shipping proof image to Supabase
    const uploadResult = await UploadService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message:
          uploadResult.message || "Failed to upload shipping proof image",
      });
    }

    const shippingImage = uploadResult.url;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify seller
    if (order.seller_id !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to confirm shipping for this order",
      });
    }

    // Check previous status
    if (order.status !== "pending_verification") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm shipping for order with status: ${order.status}`,
      });
    }

    // Update order status to 'delivering'
    const updatedOrder = await Order.markAsDelivering(
      orderId,
      shippingCode,
      shippingImage
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated to delivering",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in confirm shipping:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const confirmReceipt = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.buyer_id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to confirm receipt for this order",
      });
    }

    if (order.status !== "delivering") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm receipt for order with status: ${order.status}`,
      });
    }

    const updatedOrder = await Order.markAsAwaitRating(orderId);

    return res.status(200).json({
      success: true,
      message: "Order status updated to await_rating",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in confirm receipt order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rateTransaction = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { orderId } = req.params;

    const { score, comment } = req.body;

    // 1. Validate Point
    if (![1, -1].includes(parseInt(score))) {
      return res.status(400).json({
        success: false,
        message: "Score must be 1 (Like) or -1 (Dislike)",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "await_rating" && order.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot rate transaction for incomplete orders",
      });
    }

    // Determine target user

    let targetUserId;
    if (reviewerId === order.buyer_id) {
      targetUserId = order.seller_id;
    } else if (reviewerId === order.seller_id) {
      targetUserId = order.buyer_id;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to rate this transaction",
      });
    }

    // Ratings are checked in the Rating.add method via unique constraint
    try {
      await Rating.add({
        product_id: order.product_id,
        reviewer_id: reviewerId,
        target_user_id: targetUserId,
        score,
        comment,
      });
    } catch (err) {
      if (err.code === "23505") {
        // Unique violation
        return res.status(400).json({
          success: false,
          message: "You have already rated this transaction",
        });
      }
      throw err;
    }
    const totalRatings = await Rating.getRatingCountByOrder(orderId);
    if (totalRatings === 2) {
      // FINAL STATUS UPDATE
      await Order.markAsCompleted(orderId);
    }

    return res.status(201).json({
      success: true,
      message: "Transaction rated successfully",
    });
  } catch (error) {
    console.error("Error in rate transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.seller_id !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    if (order.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel a completed order" });
    }

    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already cancelled" });
    }

    const updatedOrder = await Order.cancel(orderId, reason);

    try {
      await Rating.add({
        product_id: order.product_id,
        reviewer_id: sellerId, // Seller rates
        target_user_id: order.buyer_id, // Buyer gets rated
        score: -1,
        // Fixed auto-rating comment per requirement
        comment: "Người thắng không thanh toán.",
      });
      console.log(`Auto-rated buyer ${order.buyer_id} with -1`);
    } catch (ratingError) {
      // If they already rated, just ignore the error so we don't break the cancellation
      if (ratingError.code !== "23505") {
        // 23505 = Unique constraint violation
        console.error("Failed to auto-rate:", ratingError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in cancel order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id; // From authMiddleware

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only allow if user is the Buyer OR the Seller
    const isBuyer = order.buyer_id === userId;
    const isSeller = order.seller_id === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a party to this transaction.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // Optional: 'seller'

    // Call the new method in the Model
    const orders = await Order.getAllByUser(userId, role);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getWonItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const wonItems = await Order.getOrdersByWinner(userId);

    return res.status(200).json({
      success: true,
      data: wonItems,
    });
  } catch (error) {
    console.error("Error fetching won items:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const order = await Order.findByProductId(productId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "No order found for this product" });
    }

    // Security check: ensure user is buyer or seller
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order by product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // 1. Check if Order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Check Permissions (User must be Buyer or Seller)
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view messages for this order",
      });
    }

    // 3. Fetch Messages
    const messages = await OrderMessage.getByOrderId(orderId);

    // 4. Return Data (Empty array if no messages, as per requirement)
    res.status(200).json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/orders/:orderId/messages
export const sendOrderMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // 1. Validate Message (Must not be empty after trim)
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // 2. Check if Order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 3. Check Permissions (User must be Buyer or Seller)
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send messages for this order",
      });
    }

    // 4. Create Message
    const newMessage = await OrderMessage.create({
      orderId,
      senderId: userId,
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updatePaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { shippingAddress } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Payment proof image is required" });
    }

    // 1. Find existing order to get the OLD image URL
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Upload NEW image
    const uploadResult = await UploadService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 3. Update Database
    const updatedOrder = await Order.updatePaymentProof(
      orderId,
      uploadResult.url,
      shippingAddress
    );

    // 4. (Optional) Delete OLD image from cloud to save space
    // if (existingOrder.payment_proof_image) {
    //   await UploadService.deleteImage(existingOrder.payment_proof_image);
    // }

    return res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
