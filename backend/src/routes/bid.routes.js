import express from "express";
import BidController from "../controllers/bid.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, BidController.addBid);
router.get("/", BidController.getProductBids);
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
