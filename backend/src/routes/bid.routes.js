import express from "express";
import BidController from "../controllers/bid.controller.js";

const router = express.Router();

router.post("/", BidController.addBid);
router.get("/", BidController.getProductBids);
router.patch("/:bid_id/accept", BidController.acceptBid);
router.patch("/:bid_id/reject", BidController.rejectBid);

export default router;
