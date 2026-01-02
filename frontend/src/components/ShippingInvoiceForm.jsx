import React, { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function ShippingInvoiceForm({ initial = {}, onSubmit }) {
  const [shippingCode, setShippingCode] = useState(initial.tracking || "");
  const [eta, setEta] = useState(initial.eta || "");
  const [cost, setCost] = useState(initial.cost || "");
  const [file, setFile] = useState(null);
  const toast = useToast();

  function handleSubmit(e) {
    e.preventDefault();

    if (!shippingCode) {
      toast.warning("Please enter a tracking number");
      return;
    }
    if (!file) {
      toast.warning("Please upload a shipping receipt image");
      return;
    }

    // Return the data in the structure the parent component expects
    onSubmit &&
      onSubmit({
        shippingCode,
        file,
        estimatedDate: eta,
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Shipping code
        </label>
        <input
          type="text"
          value={shippingCode}
          onChange={(e) => setShippingCode(e.target.value)}
          className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Shipping Receipt
        </label>

        {/* Changed from div to label so the WHOLE box is clickable */}
        <label
          htmlFor="shipping-file-upload"
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-indigo-600 hover:text-indigo-500">
                Click to upload a file
              </span>
              <span className="pl-1">or drag and drop</span>

              {/* HIDDEN INPUT */}
              <input
                id="shipping-file-upload"
                name="shipping-file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <p className="text-xs text-gray-500">
              {file ? (
                <span className="text-green-600 font-bold">
                  Selected: {file.name}
                </span>
              ) : (
                "PNG, JPG, GIF up to 10MB"
              )}
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary "
        >
          Confirm & Send Shipping Invoice
        </button>
      </div>
    </form>
  );
}
