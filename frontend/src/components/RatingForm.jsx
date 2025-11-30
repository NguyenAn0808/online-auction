import React, { useState } from "react";

export default function RatingForm({ initial = {}, onSubmit }) {
  const [rating, setRating] = useState(initial.rating || 5);
  const [comment, setComment] = useState(initial.comment || "");

  function submit(e) {
    e.preventDefault();
    onSubmit && onSubmit({ rating, comment });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rating (1-5)
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <div className="text-sm text-gray-600">Score: {rating}</div>
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Submit Rating
        </button>
      </div>
    </form>
  );
}
