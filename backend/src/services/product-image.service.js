import ProductImageModel from "../models/product-image.model.js";

class ProductImageService {
  static async getProductImages(product_id) {
    try {
      // Check if product exists
      const productExists = await ProductImageModel.productExists(product_id);
      if (!productExists) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      const images = await ProductImageModel.findByProductId(product_id);

      return {
        success: true,
        data: images,
      };
    } catch (error) {
      throw new Error(`Failed to fetch product images: ${error.message}`);
    }
  }

  static async addProductImage(product_id, imageData) {
    try {
      const { image_url, is_thumbnail, position } = imageData;

      if (!image_url) {
        return {
          success: false,
          message: "Image URL is required",
        };
      }

      const productExists = await ProductImageModel.productExists(product_id);
      if (!productExists) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      const image = await ProductImageModel.create({
        product_id,
        image_url,
        is_thumbnail,
        position,
      });

      return {
        success: true,
        data: image,
        message: "Image added successfully",
      };
    } catch (error) {
      throw new Error(`Failed to add product image: ${error.message}`);
    }
  }

  static async updateProductImage(image_id, imageData) {
    try {
      const existingImage = await ProductImageModel.findById(image_id);
      if (!existingImage) {
        return {
          success: false,
          message: "Image not found",
        };
      }

      const image = await ProductImageModel.update(image_id, imageData);

      return {
        success: true,
        data: image,
        message: "Image updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update product image: ${error.message}`);
    }
  }

  static async deleteProductImage(image_id) {
    try {
      const image = await ProductImageModel.findById(image_id);

      if (!image) {
        return {
          success: false,
          message: "Image not found",
        };
      }

      await ProductImageModel.delete(image_id);

      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete product image: ${error.message}`);
    }
  }
}

export default ProductImageService;
