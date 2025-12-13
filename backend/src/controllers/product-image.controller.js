import ProductImageService from "../services/product-image.service.js";

class ProductImageController {
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

  static async addProductImage(req, res) {
    try {
      const { id } = req.params;
      const imageData = req.body;
      const file = req.file; // Multer adds this

      const result = await ProductImageService.addProductImage(
        id,
        imageData,
        file
      );

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

  static async addMultipleProductImages(req, res) {
    try {
      const { id } = req.params;
      const files = req.files; // Array of files from multer

      // Parse metadata from form-data
      let metadata = [];
      if (req.body.metadata) {
        try {
          metadata =
            typeof req.body.metadata === "string"
              ? JSON.parse(req.body.metadata)
              : req.body.metadata;

          // Validate metadata is an array
          if (!Array.isArray(metadata)) {
            return res.status(400).json({
              success: false,
              message: "Metadata must be an array",
            });
          }
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid metadata format. Expected JSON array.",
            error: e.message,
          });
        }
      }

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files provided",
        });
      }

      const result = await ProductImageService.addMultipleProductImages(
        id,
        files,
        metadata
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message,
          errors: result.errors,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in addMultipleProductImages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default ProductImageController;
