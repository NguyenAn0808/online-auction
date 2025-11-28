import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import BlockedBidderModel from "../models/blocked-bidder.model.js";

class ProductService {
  static async getAllProducts(filters) {
    try {
      const result = await ProductModel.findAll(filters);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  static async getProductById(id) {
    try {
      const product = await ProductModel.findById(id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  static async createProduct(productData) {
    try {
      const {
        seller_id,
        category_id,
        name,
        description,
        start_price,
        step_price,
        end_time,
        auto_extend,
      } = productData;

      if (!seller_id || !category_id || !name || !description) {
        return {
          success: false,
          message:
            "Missing required fields: seller_id, category_id, name, description",
        };
      }

      if (
        !start_price ||
        !step_price ||
        !end_time ||
        auto_extend === undefined
      ) {
        return {
          success: false,
          message:
            "Missing required fields: start_price, step_price, end_time, auto_extend",
        };
      }

      const category = await CategoryModel.findById(category_id);
      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      if (start_price <= 0 || step_price <= 0) {
        return {
          success: false,
          message: "Prices must be greater than 0",
        };
      }

      const endTimeDate = new Date(end_time);
      if (endTimeDate <= new Date()) {
        return {
          success: false,
          message: "End time must be in the future",
        };
      }

      const product = await ProductModel.create(productData);

      return {
        success: true,
        data: product,
        message: "Product created successfully",
      };
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  static async updateProduct(id, productData) {
    try {
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      if (productData.end_time) {
        const endTimeDate = new Date(productData.end_time);
        if (endTimeDate <= new Date()) {
          return {
            success: false,
            message: "End time must be in the future",
          };
        }
      }

      if (
        productData.start_price !== undefined &&
        productData.start_price <= 0
      ) {
        return {
          success: false,
          message: "Start price must be greater than 0",
        };
      }

      if (productData.step_price !== undefined && productData.step_price <= 0) {
        return {
          success: false,
          message: "Step price must be greater than 0",
        };
      }

      const product = await ProductModel.update(id, productData);

      return {
        success: true,
        data: product,
        message: "Product updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  static async deleteProduct(id) {
    try {
      const product = await ProductModel.findById(id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      await ProductModel.delete(id);

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  static async rejectBidder(product_id, seller_id, bidder_id) {
    try {
      const product = await ProductModel.findById(product_id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      if (product.seller_id !== seller_id) {
        return {
          success: false,
          message: "Unauthorized: Only the seller can reject bidders",
        };
      }

      // Block the bidder for this product
      await BlockedBidderModel.create(product_id, bidder_id);

      // Reject their bids for this product
      await Bid.rejectBidderForProduct(product_id, bidder_id);

      // Find the highest bid
      const newHighestBids = await Bid.getHighest(product_id);

      // Change to the second if block the top bidder
      const newCurrentPrice = newHighestBids
        ? newHighestBids.amount
        : product.start_price;

      return {
        success: true,
        message: "Bidder blocked. Price updated to next highest bid.",
        new_current_price: newCurrentPrice,
        new_highest_bids: newHighestBids,
      };
    } catch (error) {
      console.error("Error in rejectBidder service:", error);
      throw new Error(`Failed to reject bidder: ${error.message}`);
    }
  }
}

export default ProductService;
