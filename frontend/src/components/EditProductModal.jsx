import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "./Modal";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import categoriesMock from "../data/categories.json";
import { Link } from "react-router-dom";

// Edit form schema - only allow editing photos and description
const schema = z.object({
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  newImages: z
    .array(z.instanceof(File))
    .max(24, { message: "Maximum 24 photos allowed" })
    .optional(),
});

const EditProductModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      // Set existing images
      setExistingImages(product.images || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);

      reset({
        description: product.description || "",
        newImages: [],
      });
    }
  }, [product, reset]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const totalImages =
      existingImages.length + newImageFiles.length + validFiles.length;

    if (totalImages > 24) {
      alert(
        `Maximum 24 photos allowed. You can add ${
          24 - existingImages.length - newImageFiles.length
        } more.`
      );
      return;
    }

    const newFiles = [...newImageFiles, ...validFiles];
    setNewImageFiles(newFiles);
    setValue("newImages", newFiles);
    trigger("newImages");

    // Create previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const removeNewImage = (index) => {
    const newFiles = newImageFiles.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImageFiles(newFiles);
    setNewImagePreviews(newPreviews);
    setValue("newImages", newFiles);
    trigger("newImages");
  };

  const removeExistingImage = async (imageId) => {
    // Prevent deletion - only allow adding and reordering
    alert(
      "Images cannot be deleted. You can only add new images or reorder existing ones."
    );
    return;
  };

  // Image reordering handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...existingImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setExistingImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Drag and drop handlers for file upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // Form submit handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Prepare payload with reordered images
      const payload = {
        description: data.description,
        // Send image order (array of image IDs in new order)
        image_order: existingImages.map((img) => img.id || img._id),
      };

      // Call parent's update handler
      await onUpdate(product.id, payload);

      // Upload new images if any
      if (newImageFiles.length > 0) {
        await productService.uploadProductImages(product.id, newImageFiles);
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Failed to update product:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitError(null);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      reset();
      onClose();
    }
  };

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <Modal isOpen={isOpen} title="Edit Product" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
        {/* Read-only Product Info */}
        <section className="border-b pb-5">
          <h3 className="text-sm font-bold text-gray-500 mb-3">
            PRODUCT INFO (UNEDITABLE)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Product Name:</span>
              <span className="font-medium">{product?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Start Price:</span>
              <span className="font-medium">
                {product?.start_price?.toLocaleString("vi-VN")} VND
              </span>
            </div>
            {product?.buy_now_price && (
              <div className="flex justify-between text-gray-600">
                <span>Buy Now Price:</span>
                <span className="font-medium">
                  {product?.buy_now_price?.toLocaleString("vi-VN")} VND
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Step Price:</span>
              <span className="font-medium">
                {product?.step_price?.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="border-b pb-5">
          <h3 className="text-lg font-bold mb-1">PHOTOS ({totalImages}/24)</h3>

          {/* Existing Images - Draggable for reordering */}

          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Current Images
              </p>
              <div className="grid grid-cols-6 gap-3">
                {existingImages.map((image, index) => (
                  <div
                    key={image.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOverImage(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 cursor-move transition-all ${
                      draggedIndex === index
                        ? "border-blue-500 opacity-50 scale-105"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image.url || image.image_url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-gray-700 text-white text-xs px-2 py-0.5 rounded font-medium">
                        Main
                      </div>
                    )}
                    {/* Drag handle icon */}
                    <div className="absolute top-1 right-1 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          <p className="text-sm font-medium text-gray-700 mb-2">
            New Images (will be added after existing)
          </p>

          {newImagePreviews.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-6 gap-3">
                {newImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 !bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {totalImages < 24 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  Drag or{" "}
                  <Link
                    htmlFor="image-upload"
                    className="!text-blue-600 hover:!text-blue-700 cursor-pointer underline"
                  >
                    browse
                  </Link>
                </p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}
        </section>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold mb-3">DESCRIPTION</h3>

          {/* Handle existing description */}
          <label
            htmlFor="description"
            className="block text-gray-700 font-semibold"
          ></label>
          <p className="text-sm text-gray-500">
            Add more details about your product. This will append to the
            existing description.
          </p>
          <textarea
            id="description"
            rows="8"
            className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
      {submitError && (
        <div className="mb-4 p-4 !bg-red-100 !border-red-400 !text-red-700">
          {submitError}
        </div>
      )}
    </Modal>
  );
};

export default EditProductModal;
