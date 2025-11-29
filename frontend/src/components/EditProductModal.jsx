import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "./Modal";

// Edit form schema
const schema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  start_price: z
    .number({ invalid_type_error: "Start price must be a number" })
    .min(0, { message: "Start price must be at least 0" }),
  buy_now_price: z
    .number({ invalid_type_error: "Buy now price must be a number" })
    .min(0, { message: "Buy now price must be at least 0" })
    .optional()
    .nullable(),
  step_price: z
    .number({ invalid_type_error: "Step price must be a number" })
    .min(0, { message: "Step price must be at least 0" }),
  description: z.string().min(1, { message: "Description is required" }),
  allow_unrated_bidder: z.boolean().optional(),
  auto_extend: z.boolean().optional(),
});

const EditProductModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        start_price: product.start_price || 0,
        buy_now_price: product.buy_now_price || null,
        step_price: product.step_price || 0,
        description: product.description || "",
        allow_unrated_bidder: product.allow_unrated_bidder || false,
        auto_extend: product.auto_extend || false,
      });
    }
  }, [product, reset]);

  // Form submit handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Call parent's update handler
      await onUpdate(product.id, data);

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
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Product" size="xl">
      {submitError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="name"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Product Name
          </label>
          <div className="sm:col-span-2">
            <input
              id="name"
              className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Start Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="start_price"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Start Price
          </label>
          <div className="sm:col-span-2">
            <input
              id="start_price"
              type="number"
              step="1"
              className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("start_price", { valueAsNumber: true })}
            />
            {errors.start_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.start_price.message}
              </p>
            )}
          </div>
        </div>

        {/* Buy Now Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="buy_now_price"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Buy Now Price
          </label>
          <div className="sm:col-span-2">
            <input
              id="buy_now_price"
              type="number"
              step="1"
              className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("buy_now_price", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
            />
            {errors.buy_now_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.buy_now_price.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Leave empty if not applicable
            </p>
          </div>
        </div>

        {/* Step Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="step_price"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Step Price
          </label>
          <div className="sm:col-span-2">
            <input
              id="step_price"
              type="number"
              step="1"
              className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("step_price", { valueAsNumber: true })}
            />
            {errors.step_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.step_price.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="description"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Description
          </label>
          <div className="sm:col-span-2">
            <textarea
              id="description"
              rows="5"
              className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Allow Unrated Bidder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="allow_unrated_bidder"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Allow Unrated Bidder
          </label>
          <div className="sm:col-span-2">
            <div className="flex items-center pt-2">
              <input
                id="allow_unrated_bidder"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register("allow_unrated_bidder")}
              />
              <label
                htmlFor="allow_unrated_bidder"
                className="ml-2 text-sm text-gray-600"
              >
                Allow bidders without rating to participate
              </label>
            </div>
          </div>
        </div>

        {/* Auto Extend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-3">
          <label
            htmlFor="auto_extend"
            className="text-gray-700 font-semibold text-left pt-2"
          >
            Auto Extend
          </label>
          <div className="sm:col-span-2">
            <div className="flex items-center pt-2">
              <input
                id="auto_extend"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register("auto_extend")}
              />
              <label
                htmlFor="auto_extend"
                className="ml-2 text-sm text-gray-600"
              >
                Automatically extend auction time when bid in last minutes
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
