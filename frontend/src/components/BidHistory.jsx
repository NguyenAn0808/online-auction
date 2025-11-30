"use client";

import { useMemo } from "react";
import Notification from "./Notification";

const bids = [
  { id: 1, name: "Jane Cooper", time: "1 hour ago", amount: 200.0 },
  { id: 2, name: "John Doe", time: "2 hours ago", amount: 250.0 },
  { id: 3, name: "Alex Smith", time: "3 hours ago", amount: 180.0 },
  { id: 4, name: "Lisa Wong", time: "30 minutes ago", amount: 275.0 },
];

// Replace this with real auth in your app
const CURRENT_USER_NAME = "Alex Smith";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function maskName(fullName) {
  if (!fullName) return "-";
  if (fullName === CURRENT_USER_NAME) return "You";
  const parts = fullName.split(" ");
  const first = parts[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const firstChar = first.charAt(0) || "";
  const lastChar = last.charAt(0) || "";
  return `${firstChar}••• ${lastChar}.`;
}

export default function BidHistory() {
  const sorted = useMemo(
    () => [...bids].sort((a, b) => b.amount - a.amount),
    []
  );
  const highest = sorted[0];
  const isCurrentUserHighest = highest && highest.name === CURRENT_USER_NAME;

  return (
    <div className="space-y-8 bg-gray-50">
      <div className="mx-auto max-w-2xl pt-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 bg-white border-t border-b border-gray-200 shadow-xs sm:rounded-lg sm:border">
        <div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
          <div className="flex sm:items-baseline sm:space-x-4">
            <h2 className="text-lg font-medium text-gray-900">
              Bidding history
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest bids for this auction. Bidder names are masked for privacy.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
            {isCurrentUserHighest ? (
              <Notification />
            ) : (
              <div className="text-sm text-gray-500">
                Current high:{" "}
                <span className="font-semibold text-gray-900">
                  ${highest?.amount?.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Bidder
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sorted.map((bid, idx) => {
                const isHighest = idx === 0;
                return (
                  <tr
                    key={bid.id}
                    className={classNames(
                      isHighest ? "bg-indigo-50" : "",
                      "hover:bg-gray-50"
                    )}
                  >
                    <td
                      className={classNames("py-4 pl-4 pr-3 text-sm sm:pl-6")}
                    >
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div
                            className={classNames(
                              "font-medium",
                              isHighest ? "text-indigo-700" : "text-gray-900"
                            )}
                          >
                            {maskName(bid.name)}{" "}
                            {isHighest ? (
                              <span className="ml-1 text-xs font-medium text-indigo-600">
                                (Highest)
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-gray-900">
                      ${bid.amount.toFixed(2)}
                    </td>
                    <td className="hidden px-3 py-3.5 text-sm text-gray-500 sm:table-cell">
                      {bid.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
