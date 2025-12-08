import React, { useState } from "react";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

/**
 * FeedbackModal - Modal for leaving feedback on won items
 * Props:
 *   - isOpen: whether modal is visible
 *   - item: { id, name } of the item
 *   - onSubmit: callback with { rating (1 or -1), feedback (text) }
 *   - onClose: callback to close modal
 */
export default function FeedbackModal({ isOpen, item, onSubmit, onClose }) {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === null) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      // Call the submission callback
      if (onSubmit) {
        await onSubmit({
          itemId: item.id,
          itemName: item.name,
          rating,
          feedback: feedback.trim(),
        });
      }
      // Reset and close
      setRating(null);
      setFeedback("");
      onClose();
    } catch (err) {
      alert("Error submitting feedback: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setFeedback("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Your opinion matters
              </h2>
              <p className="text-sm text-gray-500 mt-1">{item?.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating Selection */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-3">
                How was your transaction?
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRating(1)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    rating === 1
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <HandThumbUpIcon
                    className={`h-6 w-6 ${
                      rating === 1 ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Positive
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRating(-1)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    rating === -1
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <HandThumbDownIcon
                    className={`h-6 w-6 ${
                      rating === -1 ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Neutral
                  </span>
                </button>
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tell us about your experience
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                placeholder="Share your feedback (optional)"
                maxLength={500}
                rows={4}
                className="block w-full rounded-md bg-white px-3 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: `${SPACING.S} ${SPACING.L}`,
                  borderRadius: BORDER_RADIUS.FULL,
                  backgroundColor: COLORS.WHITE,
                  color: COLORS.MIDNIGHT_ASH,
                  border: `1.5px solid ${COLORS.MORNING_MIST}`,
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                className="hover:opacity-90"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === null}
                style={{
                  flex: 1,
                  padding: `${SPACING.S} ${SPACING.L}`,
                  borderRadius: BORDER_RADIUS.FULL,
                  backgroundColor:
                    submitting || rating === null
                      ? "#9ca3af"
                      : COLORS.MIDNIGHT_ASH,
                  color: COLORS.WHITE,
                  border: "none",
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  cursor:
                    submitting || rating === null ? "not-allowed" : "pointer",
                  opacity: submitting || rating === null ? 0.6 : 1,
                  transition: "opacity 0.2s ease",
                }}
                className={
                  submitting || rating === null ? "" : "hover:opacity-90"
                }
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
