import express from "express";
import {
  cancelOrder,
  confirmReceipt,
  confirmShipping,
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByProductId,
  getOrderMessages,
  getWonItems,
  rateTransaction,
  sendOrderMessage,
  updatePaymentProof,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  handleMulterError,
  uploadSingle,
} from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *          description: Order created successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *          description: Missing required fields
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *          description: Unauthorized to create order (not the winner)
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Product not found or auction not ended
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.post(
  "/",
  authenticate,
  authorize("bidder"),
  uploadSingle,
  handleMulterError,
  createOrder
);

router.post(
  "/:orderId/payment-proof",
  authenticate,
  authorize("bidder"),
  uploadSingle,
  handleMulterError,
  updatePaymentProof
);

/**
 * @openapi
 * /api/orders/{orderId}/ship:
 *   patch:
 *     summary: Confirm shipping of an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: orderId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of order
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmShippingRequest'
 *     responses:
 *       200:
 *          description: Order shipping confirmed successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *          description: Missing required fields
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *          description: Unauthorized to ship this order
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Order not found
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.patch(
  "/:orderId/shipment-proof",
  authenticate,
  authorize("seller"),
  uploadSingle,
  handleMulterError,
  confirmShipping
);

/**
 * @openapi
 * /api/orders/{orderId}/receive:
 *   patch:
 *     summary: Confirm receipt of an order (Buyer confirms delivery received)
 *     description: Buyer clicks "Yes, I received the product" to confirm receipt and complete the order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: orderId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of order
 *     responses:
 *       200:
 *          description: Order receipt confirmed successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *          description: Order status invalid (must be 'delivering')
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *          description: Unauthorized - You are not the buyer of this order
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Order not found
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.patch(
  "/:orderId/delivery-confirmation",
  authenticate,
  authorize("bidder"),
  confirmReceipt
);

/**
 * @openapi
 * /api/orders/{orderId}/rate:
 *   post:
 *     summary: Confirm rating of an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: orderId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmRatingRequest'
 *     responses:
 *       201:
 *          description: Order rating confirmed successfully
 *       400:
 *          description: Missing required fields
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *          description: Unauthorized to rate each other in this order
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Order not found
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.post("/:orderId/rate", authenticate, rateTransaction);

/**
 * @openapi
 * /api/orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: orderId
 *       schema:
 *        type: string
 *        format: uuid
 *        required: true
 *        description: ID of order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmCancelRequest'
 *     responses:
 *       200:
 *          description: Order cancellation confirmed successfully
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *          description: Cannot cancel a completed order
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *          description: Unauthorized to cancel this order
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *          description: Order not found
 *          content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *        description: Internal server error
 */
router.post("/:orderId/cancel", authenticate, authorize("seller"), cancelOrder);

/**
 * @openapi
 * /api/orders:
 *  get:
 *    summary: List all orders for the logged-in user
 *    tags: [Orders]
 *    security:
 *    - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of orders
 */
router.get("/", authenticate, getMyOrders);

/**
 * @openapi
 * /api/orders/won:
 *  get:
 *    summary: Get all won items (auctions won by the user)
 *    tags: [Orders]
 *    security:
 *    - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of won items
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/OrderResponse'
 */
router.get("/won", authenticate, getWonItems);

router.get("/:orderId", authenticate, getOrderById);

router.get("/product/:productId", authenticate, getOrderByProductId);
router.post("/:orderId/messages", authenticate, sendOrderMessage);
router.get("/:orderId/messages", authenticate, getOrderMessages);

export default router;
