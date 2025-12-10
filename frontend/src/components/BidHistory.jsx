"use client";

import { useMemo, useEffect, useState } from "react";
import Notification from "./Notification";
import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Helper to get user name from ID
function getUserName(userId) {
  const user = usersData.find((u) => u.id === userId);
  return user?.fullname || "Unknown";
}

// Fallbacks for demo/dev: some components assume globals like CURRENT_USER_ID / CURRENT_USER_NAME
// Provide safe defaults from localStorage to avoid ReferenceError in dev environment.
const CURRENT_USER_ID = (() => {
  try {
    return (
      localStorage.getItem("userId") || localStorage.getItem("userName") || null
    );
  } catch (e) {
    return null;
  }
})();

const CURRENT_USER_NAME = (() => {
  try {
    return localStorage.getItem("userName") || null;
  } catch (e) {
    return null;
  }
})();

// Minimal usersData mock to prevent runtime errors in demo mode when user service is not wired.
const usersData = window.__USERS_DATA__ || [];

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

// demo ratings for bidders (would come from user service)
const bidderRatings = {
  "Jane Cooper": 4.5,
  "John Doe": 4.2,
  "Alex Smith": 4.0,
  "Lisa Wong": 4.8,
};

function useBids() {
  const [bids, setBids] = useState([]);
  useEffect(() => {
    setBids(productService.getBidHistory());
  }, []);
  return bids;
}

function maskName(fullName, userId) {
  if (!fullName) return "-";
  if (fullName === CURRENT_USER_NAME) return "You";
  const parts = fullName.trim().split(" ");
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    return `**** ${last}`;
  }
  // single name: show first char and mask rest
  if (fullName.length <= 1) return "*";
  return `${fullName.charAt(0)}***`;
}

export default function BidHistory() {
  const bids = useBids();
  const sorted = useMemo(
    () => [...bids].sort((a, b) => b.amount - a.amount),
    [bids]
  );
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

  function renderRating(rating) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: COLORS.PEBBLE }}>
          {rating.toFixed(1)} stars
        </span>
        <span style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: "#FBBF24" }}>
          ★
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: SPACING.L,
          marginBottom: SPACING.L,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "baseline", gap: SPACING.M }}
        >
          <h2
            style={{
              fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              color: COLORS.MIDNIGHT_ASH,
              margin: 0,
            }}
          >
            Bidding history
          </h2>
          <p
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              color: COLORS.PEBBLE,
              margin: 0,
            }}
          >
            Latest bids for this auction. Bidder names are masked for privacy.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING.M,
          }}
        >
          {isCurrentUserHighest ? (
            <Notification />
          ) : (
            <div
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.PEBBLE,
              }}
            >
              Current high:{" "}
              <span
                style={{
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                ${highest?.amount?.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: COLORS.SOFT_CLOUD,
                borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
              }}
            >
              <th
                style={{
                  paddingTop: SPACING.M,
                  paddingBottom: SPACING.M,
                  paddingLeft: SPACING.M,
                  paddingRight: SPACING.M,
                  textAlign: "left",
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Bidder
              </th>
              <th
                style={{
                  paddingLeft: SPACING.M,
                  paddingRight: SPACING.M,
                  paddingTop: SPACING.M,
                  paddingBottom: SPACING.M,
                  textAlign: "left",
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Amount
              </th>
              <th
                style={{
                  paddingLeft: SPACING.M,
                  paddingRight: SPACING.M,
                  paddingTop: SPACING.M,
                  paddingBottom: SPACING.M,
                  textAlign: "left",
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Rating
              </th>
              <th
                style={{
                  paddingLeft: SPACING.M,
                  paddingRight: SPACING.M,
                  paddingTop: SPACING.M,
                  paddingBottom: SPACING.M,
                  textAlign: "left",
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((bid, idx) => {
              const isHighest = idx === 0;
              return (
                <tr
                  key={bid.id}
                  style={{
                    backgroundColor: isHighest
                      ? COLORS.SOFT_CLOUD
                      : COLORS.WHITE,
                    borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.SOFT_CLOUD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isHighest
                      ? COLORS.SOFT_CLOUD
                      : COLORS.WHITE;
                  }}
                >
                  <td
                    style={{
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: isHighest
                            ? COLORS.MIDNIGHT_ASH
                            : COLORS.MIDNIGHT_ASH,
                        }}
                      >
                        {maskName(bid.name)}{" "}
                        {isHighest ? (
                          <span
                            style={{
                              marginLeft: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: "#4F46E5",
                            }}
                          >
                            (Highest)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    ${bid.amount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                    }}
                  >
                    {bidderRatings[bid.name] ? (
                      renderRating(bidderRatings[bid.name])
                    ) : (
                      <span
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        No rating
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {new Date(bid.time).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
