import { useEffect, useRef, useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";

export default function WriteReviewModal({ open, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const panelRef = useRef(null);
  const MAX = 500;

  useEffect(() => {
    if (open) {
      setRating(5);
      setHover(0);
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
    if (!content.trim()) return;
    try {
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

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Rate this Item
          </label>

          <div className="mt-2 flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => {
              const active = (hover || rating) >= s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                  className="bg-transparent border-0 p-0"
                >
                  <StarIcon
                    className={`h-9 w-9 ${
                      active ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
            <div className="ml-2 text-sm text-gray-500">{rating} / 5</div>
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
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-md text-sm text-white ${
                content.trim()
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
