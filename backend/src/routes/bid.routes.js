import express from "express";
import BidController from "../controllers/bid.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, BidController.addBid);
router.get("/", BidController.getProductBids);
// Add route for /product/:productId to match frontend expectations
router.get("/product/:productId", BidController.getProductBids);
router.get("/user", authenticate, async (req, res, next) => {
  try {
    await BidController.getBidsByUser(req, res);
  } catch (e) {
    next(e);
  }
});
router.patch(
  "/:bid_id/accept",
  authenticate,
  authorize("seller"),
  BidController.acceptBid
);
router.patch(
  "/:bid_id/reject",
  authenticate,
  authorize("seller"),
  BidController.rejectBid
);

export default router;
