import React from "react";

/**
 * Reusable file upload component with drag-and-drop styling
 * @param {Object} props
 * @param {string} props.id - Unique ID for the input element
 * @param {string} props.label - Label text for the upload box
 * @param {File|null} props.file - Currently selected file
 * @param {function} props.onFileChange - Callback when file is selected
 * @param {string} props.accept - Accepted file types (default: "image/*")
 * @param {string} props.helpText - Help text shown when no file selected
 */
export default function FileUploadBox({
  id = "file-upload",
  label = "Upload a file",
  file = null,
  onFileChange,
  accept = "image/*",
  helpText = "PNG, JPG, GIF up to 10MB",
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Clickable upload box */}
      <label
        htmlFor={id}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
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
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload a file
            </span>
            <span className="pl-1">or drag and drop</span>

            {/* Hidden file input */}
            <input
              id={id}
              name={id}
              type="file"
              className="sr-only"
              accept={accept}
              onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
            />
          </div>
          <p className="text-xs text-gray-500">
            {file ? (
              <span className="text-green-600 font-semibold">
                ✓ Selected: {file.name}
              </span>
            ) : (
              helpText
            )}
          </p>
        </div>
      </label>
    </div>
  );
}
