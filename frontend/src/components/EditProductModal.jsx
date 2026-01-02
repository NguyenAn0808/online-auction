import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Editor } from "@tinymce/tinymce-react";
import Modal from "./Modal";
import { productService } from "../services/productService";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

// strip HTML tags to validate plain text length
const stripHtml = (value = "") => value.replace(/<[^>]*>/g, "");

// Combined edit form schema
const schema = z.object({
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .optional()
    .default(""),
  newDescription: z.string().optional().default(""),
});

// Custom refine for newDescription if it's provided
const refinedSchema = schema.superRefine((data, ctx) => {
  if (data.newDescription && data.newDescription.trim()) {
    const plain = stripHtml(data.newDescription).trim();
    if (plain.length < 10) {
      ctx.addIssue({
        path: ["newDescription"],
        code: "custom",
        message: "Description must be at least 10 characters",
      });
    }
    if (plain.length > 2000) {
      ctx.addIssue({
        path: ["newDescription"],
        code: "custom",
        message: "Description must not exceed 2000 characters",
      });
    }
  }
});

const EditProductModal = ({ isOpen, onClose, product, onUpdate }) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Description history
  const [descriptions, setDescriptions] = useState([]);
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(refinedSchema),
  });

  const newDescription = watch("newDescription", "");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      // Set existing images
      setExistingImages(product.images || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);

      // Load description history
      if (product.id) {
        const storageKey = `product_descriptions_${product.id}`;
        const stored = localStorage.getItem(storageKey);
        let productDescriptions = [];

        if (stored) {
          try {
            productDescriptions = JSON.parse(stored);
          } catch (e) {
            console.warn("Failed to parse descriptions:", e);
            productDescriptions = [];
          }
        }

        // Initialize with mock data if empty
        if (productDescriptions.length === 0) {
          productDescriptions = [
            {
              id: "desc-0",
              content: product.description || "Initial product description",
              timestamp: new Date(product.postedAt || Date.now()).toISOString(),
              author: "System",
              type: "initial",
            },
          ];
          localStorage.setItem(storageKey, JSON.stringify(productDescriptions));
        }

        setDescriptions(productDescriptions);
      }

      reset({
        description: product.description || "",
        newDescription: "",
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
      toast.warning(
        `Maximum 24 photos allowed. You can add ${
          24 - existingImages.length - newImageFiles.length
        } more.`
      );
      return;
    }

    const newFiles = [...newImageFiles, ...validFiles];
    setNewImageFiles(newFiles);
    setValue("newImageFiles", newFiles);

    // Create previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const removeNewImage = (index) => {
    const newFiles = newImageFiles.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImageFiles(newFiles);
    setNewImagePreviews(newPreviews);
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
        image_order: existingImages.map((img) => img.id || img._id),
      };

      // Call parent's update handler
      await onUpdate(product.id, payload);

      // Upload new images if any
      if (newImageFiles.length > 0) {
        await productService.uploadProductImages(product.id, newImageFiles);
      }

      // Handle description supplement
      if (data.newDescription && data.newDescription.trim()) {
        const htmlContent =
          editorRef.current?.getContent() || data.newDescription || "";

        // Create new description entry
        const newDesc = {
          id: `desc-${Date.now()}`,
          content: htmlContent,
          timestamp: new Date().toISOString(),
          author: localStorage.getItem("userName") || "Anonymous",
          type: "supplement",
        };

        // Add to descriptions
        const updatedDescriptions = [...descriptions, newDesc];
        setDescriptions(updatedDescriptions);

        // Save to localStorage
        const storageKey = `product_descriptions_${product.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedDescriptions));
      }

      // Close modal on success
      setTimeout(() => {
        onClose();
      }, 500);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
        {/* Tabs */}
        <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
          <TabList className="flex border-b bg-gray-50">
            <Tab
              className={`flex-1 px-6 py-3 text-sm font-medium transition data-selected:border-b-2 data-selected:border-midnight-ash data-selected:text-midnight-ash outline-hidden ${
                selectedTab === 0
                  ? "border-b-2 border-midnight-ash text-midnight-ash"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📸 Photos
            </Tab>
            <Tab
              className={`flex-1 px-6 py-3 text-sm font-medium transition data-selected:border-b-2 data-selected:border-midnight-ash data-selected:text-midnight-ash outline-hidden ${
                selectedTab === 1
                  ? "border-b-2 border-midnight-ash text-midnight-ash"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📝 Description
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Photos */}
            <TabPanel className="space-y-5 p-6">
              {/* Product Info */}
              <section className="border-b pb-5">
                <h3 className="text-sm font-bold text-gray-500 mb-3">
                  PRODUCT INFO
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
                <h3 className="text-lg font-bold mb-4">
                  PHOTOS ({totalImages}/24)
                </h3>

                {/* Existing Images - Draggable for reordering */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Current Images (drag to reorder)
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
                {newImagePreviews.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      New Images (will be added after existing)
                    </p>
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
            </TabPanel>

            {/* Tab 2: Description */}
            <TabPanel className="space-y-6 p-6">
              {/* Main Description */}
              <section className="border-b pb-6">
                <h3 className="text-lg font-bold mb-3">MAIN DESCRIPTION</h3>

                <textarea
                  id="description"
                  rows="5"
                  placeholder="Edit the main product description"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </section>

              {/* Description History */}
              <section className="border-b pb-6">
                <h3 className="text-lg font-bold mb-4">DESCRIPTION HISTORY</h3>

                <div className="space-y-3 max-h-96 overflow-y-auto rounded-lg p-4 bg-gray-50">
                  {descriptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No descriptions yet
                    </p>
                  ) : (
                    descriptions.map((desc, index) => (
                      <div
                        key={desc.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                Version {index + 1}
                              </span>
                              {desc.type === "initial" && (
                                <span className="text-xs bg-whisper text-pebble px-2 py-1 rounded font-medium">
                                  Initial
                                </span>
                              )}
                              {desc.type === "supplement" && (
                                <span className="text-xs bg-gray-100 text-morning-mist px-2 py-1 rounded font-medium">
                                  Added
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-gray-600 space-y-0.5">
                              <div>
                                <span className="font-medium">📅 Date:</span>{" "}
                                {new Date(desc.timestamp).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                              <div>
                                <span className="font-medium">👤 Author:</span>{" "}
                                {desc.author}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div
                            className="text-sm text-gray-700 leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: desc.content }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Add New Description */}
              <section className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-lg font-bold">
                      ADD NEW DESCRIPTION
                    </label>
                    <span className="text-xs text-gray-500">
                      {newDescription.length}/2000
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    Add supplementary information. This will be appended to the
                    existing description history, not replace it.
                  </p>

                  <Controller
                    control={control}
                    name="newDescription"
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                      <Editor
                        apiKey="fg1y693xrdhtvilhk9rorpv3qhahvdspyp8z2yhc7xs56f6v"
                        onInit={(_evt, editor) => {
                          editorRef.current = editor;
                        }}
                        value={value}
                        onEditorChange={(content) => {
                          onChange(content);
                        }}
                        init={{
                          height: 350,
                          menubar: false,
                          plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                          ],
                          toolbar:
                            "bold italic underline forecolor" +
                            "bullist numlist outdent indent | removeformat | code | help",
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      />
                    )}
                  />

                  {errors.newDescription && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.newDescription.message}
                    </p>
                  )}
                </div>
              </section>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {/* Error Message */}
        {submitError && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
            {submitError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg btn-secondary transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
