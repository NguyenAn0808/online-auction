import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

export default function TransactionSummary({ transaction, product }) {
  // 1. SAFEGUARD: If neither Transaction nor Product exists, show nothing (or loading)
  if (!transaction && !product) return null;
  // 2. HELPER: Merge Data.
  // If we are on Step 1, use 'product'. If on Step 2+, use 'transaction'.
  const displayData = {
    id: transaction?.id || product?.id || "New",
    name: transaction?.productName || product?.name || "Product Name",
    image: transaction?.productImage || product?.image || null,
    price: transaction?.winningBid || product?.current_price || 0,
    status: transaction?.status || "PENDING",
    buyer: transaction?.buyerName || transaction?.buyerId || "Me",
    seller: transaction?.sellerName || transaction?.sellerId || "Seller",
    // Safely get shipping price
    shippingPriceStr: transaction?.deliveryAddress?.deliveryMethod?.price,
  };

  // 3. SAFE CALCULATION: Handle shipping price safely
  let shippingCost = 0;
  if (displayData.shippingPriceStr) {
    // Only run .replace if the string actually exists!
    shippingCost =
      parseFloat(displayData.shippingPriceStr.replace("$", "")) || 0;
  }

  const total =
    (typeof displayData.price === "number"
      ? displayData.price
      : parseFloat(displayData.price)) + shippingCost;

  return (
    <div
      style={{
        backgroundColor: COLORS.WHITE,
        borderRadius: BORDER_RADIUS.MEDIUM,
        boxShadow: SHADOWS.CARD,
        overflow: "hidden",
        position: "sticky", // Added nice sticky behavior
        top: "20px",
      }}
    >
      {/* Product Section */}
      <div
        style={{
          display: "flex",
          gap: SPACING.M,
          padding: SPACING.M,
          borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
        }}
      >
        {displayData.image && (
          <img
            src={displayData.image}
            alt={displayData.name}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: BORDER_RADIUS.MEDIUM,
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: TYPOGRAPHY.SIZE_BODY,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              color: COLORS.MIDNIGHT_ASH,
              marginBottom: SPACING.S,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayData.name}
          </h4>
          <p
            style={{
              fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            ${Number(displayData.price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div style={{ padding: SPACING.M }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: SPACING.M,
          }}
        >
          <span
            style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: COLORS.PEBBLE }}
          >
            Status
          </span>
          <span
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
              color:
                displayData.status === "Completed"
                  ? "#16A34A"
                  : COLORS.MIDNIGHT_ASH,
              backgroundColor:
                displayData.status === "Completed"
                  ? "#F0FDF4"
                  : COLORS.SOFT_CLOUD,
              padding: `${SPACING.S} ${SPACING.M}`,
              borderRadius: BORDER_RADIUS.FULL,
              textTransform: "capitalize",
            }}
          >
            {/* SAFE REPLACE: Only replace if status exists */}
            {displayData.status.toLowerCase().replace(/_/g, " ")}
          </span>
        </div>

        {/* Order Summary Math */}
        <div
          style={{
            borderTop: `1px solid ${COLORS.MORNING_MIST}`,
            paddingTop: SPACING.M,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: SPACING.S,
            }}
          >
            <span
              style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: COLORS.PEBBLE }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              ${Number(displayData.price).toFixed(2)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: SPACING.S,
            }}
          >
            <span
              style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: COLORS.PEBBLE }}
            >
              Shipping
            </span>
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "TBD"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: SPACING.S,
              borderTop: `1px solid ${COLORS.MORNING_MIST}`,
              marginTop: SPACING.S,
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
