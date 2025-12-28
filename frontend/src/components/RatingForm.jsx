import React, { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

export default function RatingForm({ initial = {}, onSubmit }) {
  // DB constraint: ratings.score only allows 1 or -1 (like/dislike system)
  const [rating, setRating] = useState(initial.rating || null); // 1 (thumb up) or -1 (thumb down)
  const [comment, setComment] = useState(initial.comment || "");

  function submit(e) {
    e.preventDefault();
    if (rating === null) return;
    // DB constraint: ratings.score must be 1 or -1
    onSubmit && onSubmit({ rating, comment });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        {/* DB constraint: ratings.score only allows 1 or -1 (like/dislike) */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setRating(1)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              rating === 1
                ? "bg-green-50 border-green-500"
                : "bg-gray-50 border-transparent hover:bg-gray-100"
            }`}
            aria-label="Thumb up - Positive rating"
          >
            <HandThumbUpIcon
              className={`h-6 w-6 ${
                rating === 1 ? "text-green-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                rating === 1 ? "text-green-600" : "text-gray-500"
              }`}
            >
              +1
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRating(-1)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              rating === -1
                ? "bg-red-50 border-red-500"
                : "bg-gray-50 border-transparent hover:bg-gray-100"
            }`}
            aria-label="Thumb down - Negative rating"
          >
            <HandThumbDownIcon
              className={`h-6 w-6 ${
                rating === -1 ? "text-red-600" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                rating === -1 ? "text-red-600" : "text-gray-500"
              }`}
            >
              -1
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={rating === null}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            rating !== null
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Rating
        </button>
      </div>
    </form>
  );
}
