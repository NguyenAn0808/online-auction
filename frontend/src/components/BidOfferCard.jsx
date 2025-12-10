import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useNavigate } from "react-router-dom";

/**
 * BidOfferCard - Universal reusable card for bids, offers, lost items, and won items
 * Props:
 *   - id: unique identifier
 *   - name: item name
 *   - imageSrc: image URL
 *   - amount: bid/offer/price amount
 *   - status: "Highest Bid", "Outbid", "Offer pending", "Lost", "Won"
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
  endTime,
  type,
  onAction,
  onFeedback,
}) {
  const navigate = useNavigate();
  const handleCardClick = (e) => {
    if (e.target.closest("button")) {
      return;
    }
  };

  // Determine status color (PDF palette)
  const getStatusColor = () => {
    if (status === "Highest Bid" || status === "Won") return "#6CA977"; // Green
    if (status === "Outbid" || status === "Lost") return "#C85A54"; // Red
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
        return { label: "Leave Feedback", primary: true };
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
        backgroundColor: COLORS.WHITE,
        border: `1px solid rgba(179, 191, 185, 0.2)`,
        borderRadius: BORDER_RADIUS.MEDIUM,
        boxShadow: SHADOWS.SUBTLE,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="hover:shadow-light hover:scale-101"
      onClick={handleCardClick}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: SPACING.M,
          padding: SPACING.M,
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
                {status}
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
                <span style={{ color: COLORS.PEBBLE }}>Amount: </span>
                <span
                  style={{
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  ${amount}
                </span>
              </div>
              {endTime && (
                <div>
                  <span style={{ color: COLORS.PEBBLE }}>
                    {type === "lost" || type === "won" ? "Ended: " : "Time: "}
                  </span>
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {endTime}
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
                ✓ Congratulations! You won this item.
              </p>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "auto",
          }}
          className="sm:w-auto"
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
