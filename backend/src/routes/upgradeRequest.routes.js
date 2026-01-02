import express from "express";
import UpgradeRequestController from "../controllers/upgradeRequest.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  uploadDocuments,
  handleMulterError,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authenticate);

// Bidder routes
router.post(
  "/",
  authorize("bidder"),
  uploadDocuments, // Use uploadDocuments for document uploads
  handleMulterError,
  UpgradeRequestController.createRequest
);

router.get("/my-requests", UpgradeRequestController.getMyRequests);

// Admin routes
router.get("/", authorize("admin"), UpgradeRequestController.getAllRequests);

router.get("/:id", UpgradeRequestController.getRequestById);

router.post(
  "/:id/approve",
  authorize("admin"),
  UpgradeRequestController.approveRequest
);

router.post(
  "/:id/reject",
  authorize("admin"),
  UpgradeRequestController.rejectRequest
);

export default router;
