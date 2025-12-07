"use client";

import { useMemo, useState, useEffect } from "react";
import Notification from "./Notification";
import { bidService } from "../services/bidService";
import bidsData from "../data/bids.json";
import usersData from "../data/users.json";
import blocklistData from "../data/product_bid_blocklist.json";

// Mock current user - replace with real auth
const CURRENT_USER_ID = "550e8400-e29b-41d4-a716-446655440003"; // Lê Minh Cường
const IS_SELLER_MOCK = true;

// Helper to get user name from ID
function getUserName(userId) {
  const user = usersData.find((u) => u.id === userId);
  return user?.fullname || "Unknown";
}

// Helper to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function maskName(fullName, userId) {
  if (!fullName) return "-";
  if (userId === CURRENT_USER_ID) return "You";
  const parts = fullName.split(" ");
  const first = parts[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const firstChar = first.charAt(0) || "";
  const lastChar = last.charAt(0) || "";
  return `${firstChar}••• ${lastChar}.`;
}

export default function BidHistory({
  isSeller = IS_SELLER_MOCK,
  productId = "a1111111-1111-1111-1111-111111111111", // Default to first product
}) {
  const [localBids, setLocalBids] = useState([]);
  const [isProcessing, setIsProcessing] = useState({});
  const [blocklist, setBlocklist] = useState([]);
  const [showBlocklist, setShowBlocklist] = useState(false);

  // Load bids for the product on mount
  useEffect(() => {
    const productBids = bidsData
      .filter((bid) => bid.product_id === productId)
      .map((bid) => ({
        ...bid,
        name: getUserName(bid.bidder_id),
        time: formatTimeAgo(bid.createdAt),
        amount: bid.bid_amount,
      }));
    setLocalBids(productBids);

    // Load blocklist for the product
    const productBlocklist = blocklistData.filter(
      (block) => block.product_id === productId
    );
    setBlocklist(productBlocklist);
  }, [productId]);

  const sorted = useMemo(() => {
    // Filter out blocked bidders first
    const filtered = localBids.filter(
      (bid) => !blocklist.some((blocked) => blocked.bidder_id === bid.bidder_id)
    );
    // Then sort by amount descending
    return filtered.sort((a, b) => b.amount - a.amount);
  }, [localBids, blocklist]);
  const highest = sorted[0];
  const isCurrentUserHighest = highest && highest.bidder_id === CURRENT_USER_ID;

  const handleAcceptBid = async (bidId) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [bidId]: true }));
      // TODO: Uncomment when backend is ready
      // await bidService.acceptBid(bidId);

      // Mock: Update locally for now
      setLocalBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" } : b))
      );
      alert("Bid accepted successfully!");
    } catch (error) {
      console.error("Failed to accept bid:", error);
      alert(error.response?.data?.message || "Failed to accept bid");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidId]: false }));
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!confirm("Reject this bid and block the bidder from this product?")) {
      return;
    }
    try {
      setIsProcessing((prev) => ({ ...prev, [bidId]: true }));
      // await bidService.rejectBid(bidId);

      // Mock: Update locally for now
      setLocalBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b))
      );

      // Fetch updated blocklist to filter out blocked bidders
      if (productId) {
        try {
          // TODO: Uncomment when backend is ready
          // const updatedBlocklist = await bidService.getProductBlocklist(productId);
          // setBlocklist(updatedBlocklist || []);

          // Mock: Add to blocklist locally
          const rejectedBid = localBids.find((b) => b.id === bidId);
          if (rejectedBid) {
            setBlocklist((prev) => [
              ...prev,
              {
                bidder_id: rejectedBid.bidder_id || rejectedBid.name, // Use name as fallback for mock
                blocked_at: new Date().toISOString(),
              },
            ]);
          }
        } catch (error) {
          console.error("Failed to fetch blocklist:", error);
        }
      }

      alert("Bid rejected and bidder blocked from this product.");
    } catch (error) {
      console.error("Failed to reject bid:", error);
      alert(error.response?.data?.message || "Failed to reject bid");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidId]: false }));
    }
  };

  const handleUnblockBidder = async (bidderId) => {
    if (!confirm("Unblock this bidder for this product?")) {
      return;
    }
    try {
      setIsProcessing((prev) => ({ ...prev, [bidderId]: true }));
      // TODO: Uncomment when backend is ready
      // await bidService.unblockBidder(productId, bidderId);

      // Mock: Remove from blocklist locally
      setBlocklist((prev) => prev.filter((b) => b.bidder_id !== bidderId));
      alert("Bidder unblocked successfully!");
    } catch (error) {
      console.error("Failed to unblock bidder:", error);
      alert(error.response?.data?.message || "Failed to unblock bidder");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidderId]: false }));
    }
  };

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
          <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0 flex items-center gap-3">
            {isSeller && blocklist.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBlocklist(!showBlocklist)}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-300"
              >
                Blocked ({blocklist.length})
              </button>
            )}
            {isCurrentUserHighest ? (
              <Notification />
            ) : (
              <div className="text-sm text-gray-500">
                Current high:{" "}
                <span className="font-semibold text-gray-900">
                  {highest?.amount?.toLocaleString("vi-VN")} VND
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
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                {isSeller && (
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                )}
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
                            {maskName(bid.name, bid.bidder_id)}{" "}
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
                      {bid.amount.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="hidden px-3 py-3.5 text-sm text-gray-500 sm:table-cell">
                      {bid.time}
                    </td>
                    <td className="px-3 py-3.5 text-sm">
                      {bid.status === "accepted" && (
                        <span className="inline-flex items-center rounded-full !bg-green-100 px-2.5 py-0.5 text-xs font-medium !text-green-800">
                          Accepted
                        </span>
                      )}
                      {bid.status === "rejected" && (
                        <span className="inline-flex items-center rounded-full !bg-red-100 px-2.5 py-0.5 text-xs font-medium !text-red-800">
                          Rejected
                        </span>
                      )}
                      {bid.status === "pending" && (
                        <span className="inline-flex items-center rounded-full !bg-yellow-100 px-2.5 py-0.5 text-xs font-medium !text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    {isSeller && (
                      <td className="px-3 py-3.5 text-right text-sm">
                        {bid.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptBid(bid.id)}
                              disabled={isProcessing[bid.id]}
                              className="inline-flex items-center rounded !bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:!bg-green-700 disabled:!bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isProcessing[bid.id] ? "..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectBid(bid.id)}
                              disabled={isProcessing[bid.id]}
                              className="inline-flex items-center rounded !bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:!bg-red-700 disabled:!bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isProcessing[bid.id] ? "..." : "Reject"}
                            </button>
                          </div>
                        )}
                        {bid.status !== "pending" && (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Blocklist Panel */}
        {isSeller && showBlocklist && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Blocked Bidders
              </h3>
              <button
                type="button"
                onClick={() => setShowBlocklist(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {blocklist.length === 0 ? (
              <p className="text-sm text-gray-500">No blocked bidders</p>
            ) : (
              <div className="space-y-2">
                {blocklist.map((blocked) => {
                  const userName = getUserName(blocked.bidder_id);
                  const blockedDate = new Date(
                    blocked.blocked_at
                  ).toLocaleDateString("vi-VN");
                  return (
                    <div
                      key={blocked.bidder_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {maskName(userName, blocked.bidder_id)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Blocked on {blockedDate}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblockBidder(blocked.bidder_id)}
                        disabled={isProcessing[blocked.bidder_id]}
                        className="inline-flex items-center rounded !bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:!bg-blue-700 disabled:!bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isProcessing[blocked.bidder_id] ? "..." : "Unblock"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
