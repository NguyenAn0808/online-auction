"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import Notification from "./Notification";
import productService from "../services/productService";
import userService from "../services/userService";
import ratingService from "../services/ratingService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useBidPolling } from "../hooks/useBidPolling";
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

// Helper to format timestamp as dd/mm/yyyy hh:mm
function formatDateTime(dateString) {
  const d = new Date(dateString);
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function useBids(productId) {
  const [bids, setBids] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [blockedBidders, setBlockedBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidderInfo, setBidderInfo] = useState({}); // Store bidder user info by bidder_id
  const [bidderRatings, setBidderRatings] = useState({}); // Store bidder rating summary by bidder_id
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((v) => v + 1);
  }, []);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const result = await productService.getBidHistory(productId);
        // Handle both old array format (fallback) and new object format
        const bidsList = Array.isArray(result) ? result : result.bids || [];

        if (result.product) {
          setProductInfo(result.product);
        }

        if (result.blockedBidders) {
          setBlockedBidders(result.blockedBidders);
        }

        const initial = bidsList.map((bid) => ({
          ...bid,
          bidder_id: bid.bidder_id || bid.user_id || bid.name || bid.id,
          status: bid.status || "pending",
        }));
        setBids(initial);

        // Fetch bidder user info for each unique bidder_id
        const uniqueBidderIds = [
          ...new Set(initial.map((bid) => bid.bidder_id).filter(Boolean)),
        ];
        const bidderInfoMap = {};
        const bidderRatingsMap = {};

        await Promise.all(
          uniqueBidderIds.map(async (bidderId) => {
            try {
              const userData = await userService.getUserById(bidderId);
              bidderInfoMap[bidderId] = userData;
            } catch (err) {
              console.error(`Failed to load bidder info for ${bidderId}:`, err);
              bidderInfoMap[bidderId] = null;
            }
            try {
              const summary = await ratingService.getUserRatingEligibility(
                bidderId
              );
              bidderRatingsMap[bidderId] = summary;
            } catch (err) {
              console.error(
                `Failed to load bidder rating for ${bidderId}:`,
                err
              );
              bidderRatingsMap[bidderId] = null;
            }
          })
        );

        setBidderInfo(bidderInfoMap);
        setBidderRatings(bidderRatingsMap);
      } catch (error) {
        console.error("Error fetching bid history:", error);
        setBids([]);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchBids();
  }, [productId, refreshTrigger]);

  return [bids, setBids, loading, productInfo, bidderInfo, bidderRatings, refresh, blockedBidders];
}

function maskName(fullName, userId, bidderUserData) {
  // If we have bidder user data, use that for masking
  const nameToMask =
    bidderUserData?.fullName || bidderUserData?.full_name || fullName;

  if (!nameToMask) return "-";
  if (nameToMask === CURRENT_USER_NAME) return "You";

  // Remove spaces and get the actual name string
  const nameWithoutSpaces = nameToMask.trim().replace(/\s+/g, "");

  // If name is less than 3 characters, mask completely
  if (nameWithoutSpaces.length < 3) {
    return "*".repeat(nameWithoutSpaces.length);
  }

  // Always show "****" followed by last 3 characters
  const last3 = nameWithoutSpaces.slice(-3);
  return "****" + last3;
}

export default function BidHistory({ isSeller = false, productId = null }) {
  const { user } = useAuth();
  const [
    localBids,
    setLocalBids,
    loading,
    productInfo,
    bidderInfo,
    bidderRatings,
    , refresh, apiBlocklist] = useBids(productId);
  const [blocklist, setBlocklist] = useState([]);

  // Sync blocklist from API
  useEffect(() => {
    if (apiBlocklist) {
      setBlocklist(apiBlocklist);
    }
  }, [apiBlocklist]);
  const [showBlocklist, setShowBlocklist] = useState(false);
  const [isProcessing, setIsProcessing] = useState({});

  // Real-time bid polling
  const { bids: realtimeBids, highestBid } = useBidPolling(productId);

  // Update local bids when new bids arrive from polling
  useEffect(() => {
    if (realtimeBids && realtimeBids.length > 0) {
      setLocalBids(
        realtimeBids.map((bid) => ({
          ...bid,
          bidder_id: bid.bidder_id || bid.name || bid.id,
          status: bid.status || "pending",
        }))
      );
    }
  }, [realtimeBids]);

  if (!user) {
    return null;
  }
  // Use user data from context
  const currentUserId = user.id;
  const currentUserName = user.fullName || user.username || "You";

  // compute list excluding blocked bidders
  const sorted = useMemo(() => {
    const filtered = localBids.filter(
      (bid) => !blocklist.some((b) => b.bidder_id === bid.bidder_id)
    );
    return [...filtered].sort((a, b) => b.amount - a.amount);
  }, [localBids, blocklist]);

  const highest = sorted[0];
  const isCurrentUserHighest = highest && highest.bidder_id === currentUserId;

  const getBidderRatingText = (bidderId) => {
    const summary = bidderRatings?.[bidderId];
    if (!summary) return null;
    let percent = null;
    if (typeof summary.rating_percentage === "number") {
      percent = Math.round(summary.rating_percentage);
    } else if (
      summary.positive_ratings != null &&
      summary.total_ratings != null
    ) {
      if (summary.total_ratings === 0) {
        percent = 0;
      } else {
        percent = Math.round(
          (summary.positive_ratings / summary.total_ratings) * 100
        );
      }
    }
    if (percent === 0) return "No ratings";
    if (percent == null) return null;
    return `${percent}%`;
  };

  const handleAcceptBid = async (bidId) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [bidId]: true }));
      // TODO: Wire to backend via bidService.acceptBid
      setLocalBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" } : b))
      );
      alert("Bid accepted successfully!");
    } catch (error) {
      console.error("Failed to accept bid:", error);
      alert(error?.response?.data?.message || "Failed to accept bid");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidId]: false }));
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!confirm("Reject all bids from this bidder and block them from this product?")) {
      return;
    }
    try {
      setIsProcessing((prev) => ({ ...prev, [bidId]: true }));

      const targetBid = localBids.find(b => b.id === bidId);
      if (!targetBid) throw new Error("Bid not found");

      const bidderId = targetBid.bidder_id;

      await productService.rejectBidder(productId, bidderId);

      // Force refresh of history and product info (price_holder etc)
      refresh();

      alert("Bidder rejected and blocked. Product price and winner updated.");
    } catch (error) {
      console.error("Failed to reject bid:", error);
      alert(error?.message || "Failed to reject bid");
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
      await productService.unblockBidder(productId, bidderId);

      // Update local state
      setBlocklist((prev) => prev.filter((b) => b.bidder_id !== bidderId));

      // Force refresh of history and product info
      refresh();

      alert("Bidder unblocked and bids restored successfully!");
    } catch (error) {
      console.error("Failed to unblock bidder:", error);
      alert(error?.message || "Failed to unblock bidder");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidderId]: false }));
    }
  };

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
          {productInfo && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {productInfo.price_holder_name && (
                <p
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    color: COLORS.PEBBLE,
                    margin: 0,
                  }}
                >
                  Held by:{" "}
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {productInfo.price_holder_name}
                  </span>
                </p>
              )}
            </div>
          )}
          <p
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              color: COLORS.PEBBLE,
              margin: 0,
            }}
          ></p>
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
                {productInfo?.current_price ? (
                  <span>
                    ${Number(productInfo.current_price).toLocaleString("vi-VN")}
                  </span>
                ) : (
                  <span>${highest?.amount?.toFixed(2)}</span>
                )}
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
                Current Bid
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
              {isSeller && (
                <th
                  style={{
                    paddingLeft: SPACING.M,
                    paddingRight: SPACING.M,
                    paddingTop: SPACING.M,
                    paddingBottom: SPACING.M,
                    textAlign: "right",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Actions
                </th>
              )}
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
                          color: COLORS.MIDNIGHT_ASH,
                        }}
                      >
                        {maskName(
                          bid.name,
                          bid.bidder_id,
                          bidderInfo[bid.bidder_id]
                        )}{" "}
                        {(() => {
                          const txt = getBidderRatingText(bid.bidder_id);
                          return txt ? (
                            <span
                              style={{
                                marginLeft: SPACING.S,
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              ({txt})
                            </span>
                          ) : null;
                        })()}
                        {isHighest ? (
                          <span
                            style={{
                              marginLeft: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.PEBBLE,
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
                    {Number(bid.amount).toLocaleString("vi-VN")} VND
                    {bid.max_bid && (
                      <span
                        style={{
                          marginLeft: SPACING.S,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                          fontStyle: "italic",
                        }}
                      >
                        (auto)
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
                    {formatDateTime(bid.timestamp)}
                  </td>

                  {isSeller && (
                    <td
                      style={{
                        paddingLeft: SPACING.M,
                        paddingRight: SPACING.M,
                        paddingTop: SPACING.M,
                        paddingBottom: SPACING.M,
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {bid.status !== "rejected" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: SPACING.S,
                            justifyContent: "flex-end",
                          }}
                        >
                          {/* <button
                            type="button"
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={!!isProcessing[bid.id]}
                            style={{
                              padding: "6px 12px",
                              borderRadius: BORDER_RADIUS.FULL,
                              border: "none",
                              backgroundColor: "#16A34A",
                              color: COLORS.WHITE,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              cursor: isProcessing[bid.id]
                                ? "not-allowed"
                                : "pointer",
                              opacity: isProcessing[bid.id] ? 0.7 : 1,
                            }}
                          >
                            {isProcessing[bid.id] ? "..." : "Accept"}
                          </button> */}
                          <button
                            type="button"
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={!!isProcessing[bid.id]}
                            style={{
                              padding: "6px 12px",
                              borderRadius: BORDER_RADIUS.FULL,
                              border: "none",
                              backgroundColor: "#DC2626",
                              color: COLORS.WHITE,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              cursor: isProcessing[bid.id]
                                ? "not-allowed"
                                : "pointer",
                              opacity: isProcessing[bid.id] ? 0.7 : 1,
                            }}
                          >
                            {isProcessing[bid.id] ? "..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: COLORS.PEBBLE }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isSeller && (
        <div
          style={{
            marginTop: SPACING.XL,
            paddingTop: SPACING.XL,
            borderTop: `1px solid ${COLORS.MORNING_MIST}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: SPACING.M,
            }}
          >
            <h3
              style={{
                fontSize: TYPOGRAPHY.SIZE_HEADING_XS,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                margin: 0,
              }}
            >
              Blocked bidders ({blocklist.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowBlocklist((v) => !v)}
              style={{
                padding: "6px 12px",
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: COLORS.WHITE,
                color: COLORS.MIDNIGHT_ASH,
                cursor: "pointer",
              }}
            >
              {showBlocklist ? "Hide" : "Show"}
            </button>
          </div>

          {showBlocklist && (
            <div
              style={{
                display: "grid",
                gap: SPACING.S,
                backgroundColor: COLORS.SOFT_CLOUD,
                borderRadius: BORDER_RADIUS.MD,
              }}
            >
              {blocklist.length === 0 ? (
                <span
                  style={{
                    color: COLORS.PEBBLE,
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                  }}
                >
                  No blocked bidders
                </span>
              ) : (
                blocklist.map((blocked) => (
                  <div
                    key={blocked.bidder_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: COLORS.WHITE,
                      borderRadius: BORDER_RADIUS.SM,
                      boxShadow: SHADOWS.XS,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          color: COLORS.MIDNIGHT_ASH,
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                        }}
                      >
                        {maskName(
                          null,
                          blocked.bidder_id,
                          bidderInfo[blocked.bidder_id]
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        Blocked on{" "}
                        {new Date(blocked.blocked_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnblockBidder(blocked.bidder_id)}
                      disabled={!!isProcessing[blocked.bidder_id]}
                      style={{
                        padding: "6px 12px",
                        borderRadius: BORDER_RADIUS.FULL,
                        border: "none",
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        cursor: isProcessing[blocked.bidder_id]
                          ? "not-allowed"
                          : "pointer",
                        opacity: isProcessing[blocked.bidder_id] ? 0.7 : 1,
                      }}
                    >
                      {isProcessing[blocked.bidder_id] ? "..." : "Unblock"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
