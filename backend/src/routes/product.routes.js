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

router.delete("/images/:image_id", ProductImageController.deleteProductImage);

router.post(
  "/:product_id/deny-bidder",
  authenticate,
  authorize("seller"),
  ProductController.rejectBidder
);

export default router;
