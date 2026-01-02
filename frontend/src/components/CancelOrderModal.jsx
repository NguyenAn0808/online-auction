import React, { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function CancelOrderModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning("Please enter a reason for cancellation.");
      return;
    }

    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
      {/* Modal Content - Thêm shadow-2xl để tách biệt rõ modal khỏi nền mờ */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all ring-1 ring-gray-200">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-700">Cancel Transaction</h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to cancel this order?
            <br />
            <span className="font-bold text-red-600">Warning:</span> The buyer
            will automatically receive a{" "}
            <span className="font-bold">-1 Rating</span>.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-red-500 focus:border-red-500 text-sm shadow-sm"
            rows="3"
            placeholder="e.g. Buyer refused to pay..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors"
            disabled={isSubmitting}
          >
            Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium shadow-md transition-colors"
          >
            {isSubmitting ? "Processing..." : "Confirm Cancel & Rate -1"}
          </button>
        </div>
      </div>
    </div>
  );
}
