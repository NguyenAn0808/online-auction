import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import Modal from "./Modal";

// strip HTML tags to validate plain text length
const stripHtml = (value = "") => value.replace(/<[^>]*>/g, "");

// Edit description schema - append only
const schema = z.object({
  newDescription: z.string().superRefine((val, ctx) => {
    const plain = stripHtml(val).trim();
    if (plain.length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "Description must be at least 10 characters",
      });
    }
    if (plain.length > 2000) {
      ctx.addIssue({
        code: "custom",
        message: "Description must not exceed 2000 characters",
      });
    }
  }),
});

const EditDescriptionModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [descriptions, setDescriptions] = useState([]);
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const newDescription = watch("newDescription", "");

  // Initialize descriptions from localStorage mock data
  useEffect(() => {
    if (product && product.id) {
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
      reset({ newDescription: "" });
    }
  }, [product, reset]);

  // Form submit handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // ensure we use the latest HTML content from the editor
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

      // Call parent's update handler
      if (onUpdate) {
        await onUpdate(product.id, {
          newDescription: htmlContent,
          descriptions: updatedDescriptions,
        });
      }

      // Reset form
      reset({ newDescription: "" });

      // Show success and close after a brief moment
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Failed to add description:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to add description"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitError(null);
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} title="Edit Product Description" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        {/* Product Info */}
        <section className="border-b pb-5">
          <h3 className="text-sm font-bold text-gray-500 mb-3">PRODUCT INFO</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Product Name:</span>
              <span className="font-medium">{product?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Posted Date:</span>
              <span className="font-medium">
                {new Date(product?.postedAt || Date.now()).toLocaleString(
                  "vi-VN"
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Description History */}
        <section className="border-b pb-5">
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
                          <span className="font-medium">Date:</span>{" "}
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

        {/* New Description Input */}
        <section className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="newDescription"
                className="block text-lg font-bold"
              >
                ADD NEW DESCRIPTION
              </label>
              <span className="text-xs text-gray-500">
                {newDescription.length}/2000
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Add supplementary information about your product. This will be
              appended to the existing description history, not replace it.
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
                    height: 380,
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

            {submitError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitError}
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
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
            disabled={isSubmitting || !newDescription.trim()}
            className="px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Adding..." : "Add Description"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDescriptionModal;
