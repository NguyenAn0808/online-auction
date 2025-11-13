import express from "express";
import ProductController from "../controllers/product.controller.js";
import ProductImageController from "../controllers/product-image.controller.js";

const router = express.Router();

router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.post("/", ProductController.createProduct);

router.delete("/:id", ProductController.deleteProduct);

router.get("/:id/images", ProductImageController.getProductImages);

router.post("/:id/images", ProductImageController.addProductImage);

router.delete("/images/:image_id", ProductImageController.deleteProductImage);

export default router;
