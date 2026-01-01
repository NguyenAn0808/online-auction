import ProductService from "../services/product.service.js";

/**
 * Product Controller - HTTP request handlers
 */
class ProductController {
  /**
   * GET /products
   * Get all products with filters
   */
  static async getAllProducts(req, res) {
    try {
      const { category_id, search, sort, new_only, page, limit } = req.query;

      const filters = {
        category_id,
        search,
        sort,
        new_only: new_only === "true",
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      };

      const result = await ProductService.getAllProducts(filters);

      return res.status(200).json({
        success: true,
        items: result.data.items,
        pagination: result.data.pagination,
      });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * GET /products/:id
   * Get product by ID
   */
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.getProductById(id);

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
      console.error("Error in getProductById:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * POST /products
   * Create new product
   */
  static async createProduct(req, res) {
    try {
      const productData = req.body;
      const result = await ProductService.createProduct(productData);

      if (!result.success) {
        return res.status(400).json({
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
      console.error("Error in createProduct:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * PUT /products/:id
   * Update product
   */
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const result = await ProductService.updateProduct(id, productData);

      if (!result.success) {
        const statusCode = result.message === "Product not found" ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id
   * Delete product
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);

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
      console.error("Error in deleteProduct:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  static async rejectBidder(req, res) {
    try {
      const seller_id = req.user.id; // Comes from 'authenticate' middleware
      const { product_id } = req.params; // Comes from URL /:product_id/deny-bidder
      const { bidder_id } = req.body; // Comes from Frontend JSON data

      if (!bidder_id) {
        return res
          .status(400)
          .json({ success: false, message: "Bidder ID is required" });
      }

      const result = await ProductService.rejectBidder(
        product_id,
        seller_id,
        bidder_id
      );

      if (!result.success) {
        return res.status(403).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /products/with-images
   * Create product with images atomically (transactional)
   */
  static async createProductWithImages(req, res) {
    try {
      const files = req.files;

      // Parse product data from form-data
      let productData;
      try {
        productData =
          typeof req.body.product === "string"
            ? JSON.parse(req.body.product)
            : req.body.product;
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data format",
        });
      }

      if (!productData) {
        return res.status(400).json({
          success: false,
          message: "Product data is required",
        });
      }

      // Parse metadata from form-data
      let metadata = [];
      if (req.body.metadata) {
        try {
          metadata =
            typeof req.body.metadata === "string"
              ? JSON.parse(req.body.metadata)
              : req.body.metadata;
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid metadata format",
          });
        }
      }

      const result = await ProductService.createProductWithImages(
        productData,
        files,
        metadata
      );

      if (!result.success) {
        return res.status(400).json({
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
      console.error("Error in createProductWithImages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * GET /products/:id/descriptions
   * Get description history for a product
   */
  static async getDescriptionHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.getDescriptionHistory(id);

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
      console.error("Error in getDescriptionHistory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * POST /products/:id/descriptions
   * Append a new description to a product (seller only)
   */
  static async appendDescription(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const authorId = req.user.id; // From auth middleware

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Content is required",
        });
      }

      const authorRole = req.user.role;
      const result = await ProductService.appendDescription(id, content, authorId, authorRole);

      if (!result.success) {
        const statusCode = result.message.includes("Unauthorized") ? 403 : 400;
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
      console.error("Error in appendDescription:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default ProductController;
