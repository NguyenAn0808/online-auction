import supabase from "../config/supabase.js";
import { config } from "../config/settings.js";
import { randomUUID } from "crypto";
import path from "path";

class UploadService {
  static BUCKET_NAME = config.supabase.image_bucket_name;

  /**
   * Upload a single image to Supabase Storage
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @returns {Promise<{success: boolean, url?: string, message?: string}>}
   */
  static async uploadImage(fileBuffer, fileName, mimeType) {
    try {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(mimeType)) {
        return {
          success: false,
          message:
            "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
        };
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileBuffer.length > maxSize) {
        return {
          success: false,
          message: "File size exceeds 10MB limit.",
        };
      }

      // Generate unique file name
      const fileExt = path.extname(fileName);
      const uniqueFileName = `${randomUUID()}${fileExt}`;
      const filePath = `products/${uniqueFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return {
          success: false,
          message: `Failed to upload image: ${error.message}`,
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error("Upload service error:", error);
      return {
        success: false,
        message: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * Upload multiple images
   * @param {Array<{buffer: Buffer, fileName: string, mimeType: string}>} files
   * @returns {Promise<{success: boolean, urls?: Array<string>, message?: string}>}
   */
  static async uploadMultipleImages(files) {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file.buffer, file.fileName, file.mimeType)
      );

      const results = await Promise.all(uploadPromises);

      const failedUploads = results.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        return {
          success: false,
          message: `${failedUploads.length} image(s) failed to upload`,
          errors: failedUploads.map((r) => r.message),
        };
      }

      return {
        success: true,
        urls: results.map((r) => r.url),
        paths: results.map((r) => r.path),
      };
    } catch (error) {
      console.error("Multiple upload error:", error);
      return {
        success: false,
        message: `Failed to upload images: ${error.message}`,
      };
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param {string} filePath - The file path in storage
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  static async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("Supabase delete error:", error);
        return {
          success: false,
          message: `Failed to delete image: ${error.message}`,
        };
      }

      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch (error) {
      console.error("Delete service error:", error);
      return {
        success: false,
        message: `Delete failed: ${error.message}`,
      };
    }
  }

  /**
   * Extract file path from Supabase public URL
   * @param {string} url - The public URL
   * @returns {string|null} - The file path or null
   */
  static extractFilePathFromUrl(url) {
    try {
      // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const bucketIndex = pathParts.indexOf(this.BUCKET_NAME);

      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join("/");
      }

      return null;
    } catch (error) {
      console.error("Error extracting file path:", error);
      return null;
    }
  }
}

export default UploadService;
