import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

/**
 * BidOfferCard - Universal reusable card for bids, offers, lost items, and won items
 * Props:
 *   - id: unique identifier
 *   - name: item name
 *   - imageSrc: image URL
 *   - amount: bid/offer/price amount
 *   - status: "Highest Bid", "Outbid", "Offer pending", "Lost", "Won"
 *   - isWinning: boolean (optional) - for bid cards, visually indicate winning state
 *   - endTime: time remaining or end time
 *   - type: "bid" | "offer" | "lost" | "won"
 *   - onAction: callback for action button click (receives item data)
 *   - onFeedback: callback for feedback (only for "won" type)
 */
export default function BidOfferCard({
  id,
  name,
  imageSrc,
  amount,
  status,
  isWinning,
  endTime,
  type,
  orderStep,
  onAction,
  onFeedback,
}) {
  const handleCardClick = (e) => {
    if (e.target.closest("button")) {
      return;
    }
  };

  const effectiveStatus =
    isWinning === true || status === "Highest Bid" ? "Winning" : status;

  // Format amount to VND: xx.xxx.xxx VND
  const formatVND = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "-";
    }
    try {
      const formatted = new Intl.NumberFormat("vi-VN").format(Number(value));
      return `${formatted} VND`;
    } catch {
      return `${value} VND`;
    }
  };

  // Compute responsive time remaining (days/hours/minutes left)
  const getTimeRemainingLabel = () => {
    if (!endTime) return "";
    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return endTime; // fallback to provided string
    }
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return "Ended";
    const minutes = Math.floor(diffMs / (60 * 1000));
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  // Determine status color (PDF palette)
  const getStatusColor = () => {
    if (effectiveStatus === "Winning" || effectiveStatus === "Won")
      return "#6CA977"; // Green
    if (effectiveStatus === "Outbid" || effectiveStatus === "Lost")
      return "#C85A54"; // Red
    return COLORS.PEBBLE;
  };

  // Determine action button configuration
  const getActionButton = () => {
    switch (type) {
      case "bid":
      case "offer":
        return { label: "View Auction", primary: true };
      case "lost":
        return { label: "View Item", primary: false };
      case "won":
        // Show "Go to Transaction" until step 3 is finished, then show "Feedback"
        return {
          label: orderStep >= 3 ? "Feedback" : "Go to Transaction",
          primary: true,
        };
      default:
        return { label: "View", primary: true };
    }
  };

  const actionButton = getActionButton();

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (type === "won" && onFeedback) {
      onFeedback({ id, name });
    } else if (onAction) {
      onAction({ id, name, type });
    }
  };

  return (
    <div
      style={{
        borderRadius: BORDER_RADIUS.MEDIUM,
        boxShadow: SHADOWS.SUBTLE,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className={
        isWinning === true
          ? "bg-green-50 border border-green-500 hover:shadow-light hover:scale-101"
          : effectiveStatus === "Outbid"
          ? "bg-red-50 border border-orange-300 hover:shadow-light hover:scale-101"
          : "bg-white border border-[rgba(179,191,185,0.2)] hover:shadow-light hover:scale-101"
      }
      onClick={handleCardClick}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: SPACING.M,
          padding: SPACING.M,
          position: "relative",
        }}
        className="sm:flex-row flex-col"
      >
        {/* Left: Image */}
        <div
          style={{
            flexShrink: 0,
            width: "160px",
            height: "160px",
            backgroundColor: COLORS.SOFT_CLOUD,
            borderRadius: BORDER_RADIUS.MEDIUM,
            overflow: "hidden",
          }}
          className="w-full sm:w-40"
        >
          <img
            src={imageSrc || "/images/sample.jpg"}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Middle: Details */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: SPACING.M,
          }}
        >
          {/* Title */}
          <div>
            <h3
              style={{
                fontSize: TYPOGRAPHY.SIZE_PRODUCT_TITLE,
                fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                color: COLORS.MIDNIGHT_ASH,
                marginBottom: SPACING.S,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {name || "Untitled Item"}
            </h3>

            {/* Status badge */}
            <div style={{ marginBottom: SPACING.S }}>
              <p
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: getStatusColor(),
                }}
              >
                {effectiveStatus}
              </p>
            </div>

            {/* Amount and time */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: SPACING.L,
                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
              }}
            >
              <div>
                <span style={{ color: COLORS.PEBBLE }}>Your bid: </span>
                <span
                  style={{
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  {formatVND(amount)}
                </span>
              </div>
              {endTime && (
                <div>
                  <span style={{ color: COLORS.PEBBLE }}>
                    {type === "lost" || type === "won"
                      ? "Ended: "
                      : "Time left: "}
                  </span>
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {type === "lost" || type === "won"
                      ? endTime
                      : getTimeRemainingLabel()}
                  </span>
                </div>
              )}
            </div>

            {/* Additional messaging */}
            {type === "lost" && (
              <p
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: COLORS.PEBBLE,
                  marginTop: SPACING.S,
                }}
              >
                You didn't win this item. Check similar items in your watchlist.
              </p>
            )}
            {type === "won" && (
              <p
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: "#6CA977",
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  marginTop: SPACING.S,
                }}
              >
                Congratulations! You won this item.
              </p>
            )}
          </div>
        </div>

        {/* Action (bottom-right) */}
        <div
          style={{
            position: "absolute",
            bottom: SPACING.M,
            right: SPACING.M,
          }}
        >
          <button
            onClick={handleActionClick}
            data-no-navigate="true"
            style={{
              padding: `4px ${SPACING.L}`,
              borderRadius: BORDER_RADIUS.FULL,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              transition: "all 0.2s ease",
              fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
              whiteSpace: "nowrap",
              border: actionButton.primary
                ? "none"
                : `1.5px solid ${COLORS.MORNING_MIST}`,
              backgroundColor: actionButton.primary
                ? COLORS.MIDNIGHT_ASH
                : "transparent",
              color: actionButton.primary ? COLORS.WHITE : COLORS.MIDNIGHT_ASH,
              cursor: "pointer",
              minHeight: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className={
              actionButton.primary ? "hover:opacity-90" : "hover:bg-whisper"
            }
          >
            {/* {actionButton.label == "View Item" ? ({
              navigate(`/products/${id}`);
            }) : actionButton.label}  */}
            {actionButton.label}
          </button>
        </div>
      </div>
    </div>
  );
}
