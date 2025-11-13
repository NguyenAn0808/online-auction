import ProductImageService from "../services/product-image.service.js";

/**
 * ProductImage Controller - HTTP request handlers
 */
class ProductImageController {
  /**
   * GET /products/:id/images
   * Get all images for a product
   */
  static async getProductImages(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductImageService.getProductImages(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getProductImages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * POST /products/:id/images
   * Add image to product
   */
  static async addProductImage(req, res) {
    try {
      const { id } = req.params;
      const imageData = req.body;
      const result = await ProductImageService.addProductImage(id, imageData);

      if (!result.success) {
        const statusCode = result.message === "Product not found" ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in addProductImage:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /products/images/:image_id
   * Delete product image
   */
  static async deleteProductImage(req, res) {
    try {
      const { image_id } = req.params;
      const result = await ProductImageService.deleteProductImage(image_id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in deleteProductImage:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default ProductImageController;
