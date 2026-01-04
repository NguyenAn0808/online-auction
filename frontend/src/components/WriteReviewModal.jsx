import { useEffect, useRef, useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

export default function WriteReviewModal({ open, onClose, onSubmit }) {
  // DB constraint: ratings.score only allows 1 or -1 (like/dislike system)
  const [rating, setRating] = useState(null); // 1 (thumb up) or -1 (thumb down)
  const [content, setContent] = useState("");
  const panelRef = useRef(null);
  const MAX = 500;

  useEffect(() => {
    if (open) {
      setRating(null);
      setContent("");
      setTimeout(
        () => panelRef.current?.querySelector("textarea")?.focus(),
        50
      );
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || rating === null) return;
    try {
      // DB constraint: ratings.score must be 1 or -1
      await onSubmit?.({ rating, content });
      onClose?.();
    } catch (err) {
      console.error("Submit review failed", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6"
      >
        <div className="nav-bar">
          <div className="text-3xl font-bold tracking-tight">eBid</div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Your opinion matters
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please take a moment to review your recent purchase. Your feedback
            helps other buyers and the seller.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate this Item
          </label>

          {/* DB constraint: ratings.score only allows 1 or -1 (like/dislike) */}
          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setRating(1)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                rating === 1
                  ? "bg-green-50 border-green-500 scale-105"
                  : "bg-gray-50 border-transparent hover:bg-gray-100"
              }`}
              aria-label="Thumb up - Positive rating"
            >
              <HandThumbUpIcon
                className={`h-8 w-8 ${
                  rating === 1 ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  rating === 1 ? "text-green-600" : "text-gray-500"
                }`}
              >
                +1
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRating(-1)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                rating === -1
                  ? "bg-red-50 border-red-500 scale-105"
                  : "bg-gray-50 border-transparent hover:bg-gray-100"
              }`}
              aria-label="Thumb down - Negative rating"
            >
              <HandThumbDownIcon
                className={`h-8 w-8 ${
                  rating === -1 ? "text-red-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  rating === -1 ? "text-red-600" : "text-gray-500"
                }`}
              >
                -1
              </span>
            </button>
          </div>

          <div className="mt-4 relative">
            <label
              htmlFor="review"
              className="block text-sm font-medium text-gray-700"
            >
              Tell us about your experience
            </label>
            <textarea
              id="review"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX))}
              rows={6}
              maxLength={MAX}
              placeholder="Please be as specific as possible"
              className="mt-2 w-full rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="absolute right-3 bottom-3 text-xs text-gray-500">
              {content.length}/{MAX}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!content.trim() || rating === null}
              className={`px-4 py-2 rounded-md text-sm text-white ${
                content.trim() && rating !== null
                  ? "bg-black hover:bg-gray-800"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Submit review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
