import ProductImageModel from "../models/product-image.model.js";
import UploadService from "./upload.service.js";

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

  static async addProductImage(product_id, imageData, file = null) {
    try {
      const { is_thumbnail, position } = imageData;
      let image_url = imageData.image_url;

      // Check if product exists
      const productExists = await ProductImageModel.productExists(product_id);
      if (!productExists) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // If file is provided, upload to Supabase
      if (file) {
        const uploadResult = await UploadService.uploadImage(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        if (!uploadResult.success) {
          return {
            success: false,
            message: uploadResult.message,
          };
        }

        image_url = uploadResult.url;
      } else if (!image_url) {
        // If no file & no URL provided
        return {
          success: false,
          message: "Either image file or image URL is required",
        };
      }

      const image = await ProductImageModel.create({
        product_id,
        image_url,
        is_thumbnail: is_thumbnail || false,
        position: position || 0,
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

      if (image.image_url && image.image_url.includes("supabase")) {
        const filePath = UploadService.extractFilePathFromUrl(image.image_url);
        if (filePath) {
          await UploadService.deleteImage(filePath);
        }
      }

      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete product image: ${error.message}`);
    }
  }

  /**
   * Add multiple images with metadata (thumbnail flag and positions)
   * @param {string} product_id - Product UUID
   * @param {Array} files - Array of uploaded files from multer
   * @param {Array} metadata - Array of {position: number, is_thumbnail: boolean}
   * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
   */
  static async addMultipleProductImages(product_id, files, metadata = []) {
    try {
      // Check if product exists
      const productExists = await ProductImageModel.productExists(product_id);
      if (!productExists) {
        return {
          success: false,
          statusCode: 404,
          message: "Product not found",
        };
      }

      // Prevent multiple thumbnails
      const thumbnailCount = metadata.filter((m) => m && m.is_thumbnail).length;
      if (thumbnailCount > 1) {
        return {
          success: false,
          statusCode: 400,
          message: "Only one thumbnail image is allowed",
        };
      }

      // Uploading thumbnail when one already exists => replace it
      if (thumbnailCount === 1) {
        const existingThumbnail = await ProductImageModel.findThumbnail(
          product_id
        );
        if (existingThumbnail) {
          // Unset the existing thumbnail
          await ProductImageModel.update(existingThumbnail.id, {
            is_thumbnail: false,
          });
        }
      }

      // Upload all images to Supabase
      const uploadPromises = files.map((file) =>
        UploadService.uploadImage(file.buffer, file.originalname, file.mimetype)
      );

      const uploadResults = await Promise.all(uploadPromises);

      const successfulUploads = uploadResults
        .map((result, index) => ({
          ...result,
          originalIndex: index,
        }))
        .filter((res) => res.success);

      const failedUploads = uploadResults.filter((res) => !res.success);

      if (successfulUploads.length === 0) {
        return {
          success: false,
          statusCode: 400,
          message: "All uploads failed",
          errors: failedUploads.map((f) => f.message),
        };
      }

      // Create database records for successful uploads
      const imageCreationPromises = successfulUploads.map((upload) => {
        const meta = metadata[upload.originalIndex] || {};
        return ProductImageModel.create({
          product_id,
          image_url: upload.url,
          is_thumbnail: meta.is_thumbnail || false,
          position: meta.position ?? upload.originalIndex,
        });
      });

      const createdImages = await Promise.all(imageCreationPromises);

      return {
        success: true,
        data: {
          uploaded: createdImages,
          failed: failedUploads.length,
        },
        message: `${createdImages.length} images uploaded successfully${
          failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ""
        }`,
      };
    } catch (error) {
      throw new Error(
        `Failed to add multiple product images: ${error.message}`
      );
    }
  }
}

export default ProductImageService;
