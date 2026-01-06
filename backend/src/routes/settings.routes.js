import express from "express";
import SettingsController from "../controllers/settings.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - get auto-extend settings (needed for bid logic)
router.get("/auto-extend", SettingsController.getAutoExtendSettings);

// Admin only routes
router.get(
  "/",
  authenticate,
  authorize("admin"),
  SettingsController.getAllSettings
);
router.get(
  "/:key",
  authenticate,
  authorize("admin"),
  SettingsController.getSetting
);
router.put(
  "/:key",
  authenticate,
  authorize("admin"),
  SettingsController.updateSetting
);

// Initialize defaults (run once, admin only)
router.post(
  "/initialize",
  authenticate,
  authorize("admin"),
  SettingsController.initializeDefaults
);

export default router;
