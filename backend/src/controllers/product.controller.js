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
        ...result.data,
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
      const seller_id = req.user.id;
      const { product_id } = req.params;
      const { bidder_id } = req.body;

      if (!bidder_id) {
        return res.status(400).json({
          success: false,
          message: "Bidder ID is required",
        });
      }

      const result = await ProductService.rejectBidder(
        product_id,
        seller_id,
        bidder_id
      );

      if (!result.success) {
        return res.status(403).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in rejectBidder:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default ProductController;
