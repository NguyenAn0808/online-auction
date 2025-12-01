import ProductModel from "../models/product.model.js";
import Bid from "../models/Bid.js";
import Order from "../models/Order.js";
import Rating from "../models/Rating.js";
import UploadService from "../services/upload.service.js";
import pool from "../config/database.js";

export const createOrder = async (req, res) => {
  try {
    const winnerId = req.user?.id;
    const { productId, shippingAddress } = req.body;

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
    const product = await ProductModel.findById(productId);
    if (!product || product.status !== "ended") {
      return res.status(404).json({
        success: false,
        message: "Product is not found or does not exist",
      });
    }

    // Verify winner
    const winnerBidder = await Bid.getHighest(productId);

    if (!winnerBidder || winnerBidder.bidder_id !== winnerId) {
      return res.status(403).json({
        success: false,
        message: "You are not the winner of this product",
      });
    }

    const existingOrder = await Order.findByProduct(productId);

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order for this product already exists",
      });
    }

    // Create order
    const order = await Order.create({
      productId,
      buyerId: winnerId,
      sellerId: product.seller_id,
      finalPrice: winnerBidder.amount,
      proofImage,
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

    const updatedOrder = await Order.markAsCompleted(orderId);

    return res.status(200).json({
      success: true,
      message: "Order status updated to completed",
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

    if (order.status !== "completed") {
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
