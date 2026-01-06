"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
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
import { useToast } from "../context/ToastContext";
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
              bidderInfoMap[bidderId] = null;
              showModal(
                "Failed to load bidder info",
                `Bidder ${bidderId}: ${err?.message || "Unknown error"}`
              );
            }
            try {
              const summary = await ratingService.getUserRatingEligibility(
                bidderId
              );
              bidderRatingsMap[bidderId] = summary;
            } catch (err) {
              bidderRatingsMap[bidderId] = null;
              showModal(
                "Failed to load bidder rating",
                `Bidder ${bidderId}: ${err?.message || "Unknown error"}`
              );
            }
          })
        );

        setBidderInfo(bidderInfoMap);
        setBidderRatings(bidderRatingsMap);
      } catch (error) {
        setBids([]);
        showModal(
          "Error fetching bid history",
          error?.message || "Unknown error"
        );
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchBids();
  }, [productId, refreshTrigger]);

  return [
    bids,
    setBids,
    loading,
    productInfo,
    bidderInfo,
    bidderRatings,
    refresh,
    blockedBidders,
  ];
}

function maskName(fullName, userId, bidderUserData) {
  // If we have bidder user data, use that for masking
  const nameToMask =
    bidderUserData?.fullName || bidderUserData?.full_name || fullName;

  if (!nameToMask) return "-";
  if (nameToMask === CURRENT_USER_NAME) return "You";

  // Remove spaces and get the actual name string
  const nameWithoutSpaces = nameToMask.trim().replace(/\s+/g, "");

  // If name is less than 2 characters, mask completely
  if (nameWithoutSpaces.length < 2) {
    return "*".repeat(nameWithoutSpaces.length);
  }

  // Mask every other character: 'nndkhoa' → 'n*d*h*a'
  let masked = "";
  for (let i = 0; i < nameWithoutSpaces.length; i++) {
    masked += i % 2 === 0 ? nameWithoutSpaces[i] : "*";
  }
  return masked;
}

export default function BidHistory({ isSeller = false, productId = null }) {
  const { user } = useAuth();
  const toast = useToast();
  const TIME_COL_WIDTH = 170;
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
  });
  const showModal = useCallback((title, message) => {
    setModalState({ open: true, title, message });
  }, []);
  const hideModal = useCallback(() => {
    setModalState({ open: false, title: "", message: "" });
  }, []);
  // Confirmation modal state and helpers
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
  });
  const confirmResolveRef = useRef(null);
  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({ open: true, title, message });
    });
  }, []);
  const confirmYes = useCallback(() => {
    setConfirmState({ open: false, title: "", message: "" });
    if (confirmResolveRef.current) {
      confirmResolveRef.current(true);
      confirmResolveRef.current = null;
    }
  }, []);
  const confirmNo = useCallback(() => {
    setConfirmState({ open: false, title: "", message: "" });
    if (confirmResolveRef.current) {
      confirmResolveRef.current(false);
      confirmResolveRef.current = null;
    }
  }, []);
  const [
    localBids,
    setLocalBids,
    loading,
    productInfo,
    bidderInfo,
    bidderRatings,
    refresh,
    apiBlocklist,
  ] = useBids(productId);

  // Use apiBlocklist directly, but allow local additions for instant UI feedback
  const [localBlocklistAdditions, setLocalBlocklistAdditions] = useState([]);
  const blocklist = useMemo(() => {
    const apiList = apiBlocklist || [];
    // Merge API blocklist with any local additions (for instant feedback before refresh)
    const combined = [...apiList];
    localBlocklistAdditions.forEach((addition) => {
      if (!combined.some((b) => b.bidder_id === addition.bidder_id)) {
        combined.push(addition);
      }
    });
    return combined;
  }, [apiBlocklist, localBlocklistAdditions]);

  const [showBlocklist, setShowBlocklist] = useState(false);
  const [isProcessing, setIsProcessing] = useState({});

  // Real-time bid polling - only use for notifications/updates, not to replace localBids
  const { bids: realtimeBids, highestBid } = useBidPolling(productId);

  // Monitor polling for NEW bids only (to trigger refresh if needed)
  // Don't directly overwrite localBids as polling doesn't respect blocklist
  useEffect(() => {
    // Ensure realtimeBids and localBids are arrays before processing
    if (
      !Array.isArray(realtimeBids) ||
      realtimeBids.length === 0 ||
      !Array.isArray(localBids) ||
      localBids.length === 0
    ) {
      return;
    }

    // Check if polling has new bids that aren't in localBids
    const hasNewBids = realtimeBids.some(
      (rtBid) => !localBids.some((lb) => lb.id === rtBid.id)
    );

    // If there are genuinely new bids, refresh to get updated data with proper blocklist
    if (hasNewBids) {
      refresh();
    }
  }, [realtimeBids, localBids, refresh]);

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

  // Prefer highest bidder from API over local sorting
  const highestBidderIdFromApi =
    productInfo?.price_holder || productInfo?.highest_bidder_id || null;
  const highest = sorted[0];
  const isCurrentUserHighest = highestBidderIdFromApi
    ? highestBidderIdFromApi === currentUserId
    : highest && highest.bidder_id === currentUserId;

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
      toast.success("Bid accepted successfully!");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept bid";
      toast.error(msg);
      showModal("Failed to accept bid", msg);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidId]: false }));
    }
  };

  const handleRejectBid = async (bidId) => {
    const confirmed = await showConfirm(
      "Confirm reject & block",
      "Reject all bids from this bidder and block them from this product?"
    );
    if (!confirmed) return;
    try {
      setIsProcessing((prev) => ({ ...prev, [bidId]: true }));

      const targetBid = localBids.find((b) => b.id === bidId);
      if (!targetBid) throw new Error("Bid not found");

      const bidderId = targetBid.bidder_id;

      await productService.rejectBidder(productId, bidderId);

      // Immediately add to local blocklist for instant UI feedback
      setLocalBlocklistAdditions((prev) => {
        // Check if already in local additions
        if (prev.some((b) => b.bidder_id === bidderId)) {
          return prev;
        }
        return [
          ...prev,
          {
            bidder_id: bidderId,
            product_id: productId,
            blocked_at: new Date().toISOString(),
          },
        ];
      });

      // Force refresh of history and product info (price_holder etc)
      // This will update apiBlocklist and clear localBlocklistAdditions won't be needed
      refresh();

      toast.success(
        "Bidder rejected and blocked. Product price and winner updated."
      );
    } catch (error) {
      const msg = error?.message || "Failed to reject bid";
      toast.error(msg);
      showModal("Failed to reject bid", msg);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [bidId]: false }));
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
          {/* {productInfo && (
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
          )} */}
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
                  {Number(productInfo.current_price).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
              ) : (
                <span>{highest?.amount?.toFixed(2)} VND</span>
              )}
            </span>
          </div>
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
              {isSeller && (
                <th
                  style={{
                    paddingLeft: SPACING.M,
                    paddingRight: SPACING.M,
                    paddingTop: SPACING.M,
                    paddingBottom: SPACING.M,
                    textAlign: "center",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Rating
                </th>
              )}
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
                  width: TIME_COL_WIDTH,
                  whiteSpace: "nowrap",
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
                    textAlign: "center",
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
              // Mark highest via API when available; fall back to first row
              const isApiHighest =
                highestBidderIdFromApi &&
                bid.bidder_id === highestBidderIdFromApi;
              const isHighest =
                isApiHighest || (!highestBidderIdFromApi && idx === 0);
              return (
                <tr
                  key={bid.id}
                  style={{
                    backgroundColor: COLORS.WHITE,
                    borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.SOFT_CLOUD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.WHITE;
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
                        {isSeller
                          ? bidderInfo[bid.bidder_id]?.full_name ||
                            bidderInfo[bid.bidder_id]?.fullName ||
                            bid.name ||
                            "-"
                          : maskName(
                              bid.name,
                              bid.bidder_id,
                              bidderInfo[bid.bidder_id]
                            )}{" "}
                        {!isSeller &&
                          (() => {
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
                  {isSeller && (
                    <td
                      style={{
                        paddingLeft: SPACING.M,
                        paddingRight: SPACING.M,
                        paddingTop: SPACING.M,
                        paddingBottom: SPACING.M,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <a
                        href={`/user/${bid.bidder_id}/ratings`}
                        className="text-pebble text-xs !underline "
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        View
                      </a>
                    </td>
                  )}
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
                      width: TIME_COL_WIDTH,
                      whiteSpace: "nowrap",
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
                            justifyContent: "center",
                          }}
                        >
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
                        width: TIME_COL_WIDTH,
                        whiteSpace: "nowrap",
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
                  {blocklist.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          paddingTop: SPACING.M,
                          paddingBottom: SPACING.M,
                          paddingLeft: SPACING.M,
                          paddingRight: SPACING.M,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                          textAlign: "center",
                        }}
                      >
                        No blocked bidders
                      </td>
                    </tr>
                  ) : (
                    blocklist.map((blocked) => {
                      const fullName =
                        bidderInfo[blocked.bidder_id]?.full_name ||
                        bidderInfo[blocked.bidder_id]?.fullName ||
                        blocked.name ||
                        blocked.bidder_id ||
                        "-";
                      return (
                        <tr
                          key={blocked.bidder_id}
                          style={{
                            backgroundColor: COLORS.WHITE,
                            borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.SOFT_CLOUD;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.WHITE;
                          }}
                        >
                          <td
                            style={{
                              paddingTop: SPACING.M,
                              paddingBottom: SPACING.M,
                              paddingLeft: SPACING.M,
                              paddingRight: SPACING.M,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                            }}
                          >
                            {fullName}
                          </td>
                          <td
                            style={{
                              paddingLeft: SPACING.M,
                              paddingRight: SPACING.M,
                              paddingTop: SPACING.M,
                              paddingBottom: SPACING.M,
                              width: TIME_COL_WIDTH,
                              whiteSpace: "nowrap",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            {blocked.blocked_at
                              ? formatDateTime(blocked.blocked_at)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {confirmState.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.WHITE,
              borderRadius: BORDER_RADIUS.MD,
              boxShadow: SHADOWS.MD,
              minWidth: 320,
              maxWidth: 560,
              padding: SPACING.L,
            }}
          >
            <h4
              style={{
                margin: 0,
                marginBottom: SPACING.S,
                fontSize: TYPOGRAPHY.SIZE_HEADING_XS,
                color: COLORS.MIDNIGHT_ASH,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              }}
            >
              {confirmState.title}
            </h4>
            <p
              style={{
                margin: 0,
                marginBottom: SPACING.M,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              {confirmState.message}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: SPACING.S,
              }}
            >
              <button
                type="button"
                onClick={confirmNo}
                style={{
                  padding: "6px 12px",
                  borderRadius: BORDER_RADIUS.FULL,
                  border: `1px solid ${COLORS.MORNING_MIST}`,
                  backgroundColor: COLORS.WHITE,
                  color: COLORS.MIDNIGHT_ASH,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmYes}
                style={{
                  padding: "6px 12px",
                  borderRadius: BORDER_RADIUS.FULL,
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: COLORS.WHITE,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {modalState.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={hideModal}
        >
          <div
            style={{
              backgroundColor: COLORS.WHITE,
              borderRadius: BORDER_RADIUS.MD,
              boxShadow: SHADOWS.MD,
              minWidth: 320,
              maxWidth: 560,
              padding: SPACING.L,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              style={{
                margin: 0,
                marginBottom: SPACING.S,
                fontSize: TYPOGRAPHY.SIZE_HEADING_XS,
                color: COLORS.MIDNIGHT_ASH,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              }}
            >
              {modalState.title}
            </h4>
            <p
              style={{
                margin: 0,
                marginBottom: SPACING.M,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              {modalState.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={hideModal}
                style={{
                  padding: "6px 12px",
                  borderRadius: BORDER_RADIUS.FULL,
                  border: "none",
                  backgroundColor: COLORS.MIDNIGHT_ASH,
                  color: COLORS.WHITE,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
