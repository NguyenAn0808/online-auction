import express from "express";
import ProductController from "../controllers/product.controller.js";
import ProductImageController from "../controllers/product-image.controller.js";
import {
  uploadSingle,
  uploadMultiple,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.post("/", ProductController.createProduct);

// Atomic endpoint: create product with images in a single transaction
router.post(
  "/with-images",
  uploadMultiple,
  handleMulterError,
  ProductController.createProductWithImages
);

router.delete("/:id", ProductController.deleteProduct);

router.get("/:id/images", ProductImageController.getProductImages);

router.post(
  "/:id/images",
  uploadSingle,
  handleMulterError,
  ProductImageController.addProductImage
);

router.post(
  "/:id/images/upload-multiple",
  uploadMultiple,
  handleMulterError,
  ProductImageController.addMultipleProductImages
);

// Alias for frontend compatibility (frontend calls /bulk)
router.post(
  "/:id/images/bulk",
  uploadMultiple,
  handleMulterError,
  ProductImageController.addMultipleProductImages
);

router.delete("/images/:image_id", ProductImageController.deleteProductImage);

router.post(
  "/:product_id/deny-bidder",
  authenticate,
  authorize("seller"),
  ProductController.rejectBidder
);

// Description history routes (append-only descriptions per requirements 3.2)
router.get("/:id/descriptions", ProductController.getDescriptionHistory);
router.post(
  "/:id/descriptions",
  authenticate,
  authorize("seller", "admin"),
  ProductController.appendDescription
);

export default router;
