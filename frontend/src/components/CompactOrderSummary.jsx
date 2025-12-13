import React from "react";

// Compact summary card used in lists for bids/offers. Shows concise info only.
export default function CompactOrderSummary({ item }) {
  // item: { id, name, status, amount, endTime }
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-12 w-12 shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
          {item.name ? item.name[0] : "#"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-900">
            {item.name}
          </div>
          <div className="mt-1 text-xs text-gray-500">{item.status}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {item.amount && (
          <div className="text-sm font-semibold text-gray-900">
            ${item.amount}
          </div>
        )}
        {item.endTime && (
          <div className="text-xs text-gray-500">Ends: {item.endTime}</div>
        )}
      </div>
    </div>
  );
}
