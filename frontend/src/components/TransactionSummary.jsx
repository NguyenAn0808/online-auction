import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

export default function TransactionSummary({ transaction }) {
  if (!transaction) return null;

  return (
    <div
      style={{
        backgroundColor: COLORS.WHITE,
        borderRadius: BORDER_RADIUS.MEDIUM,
        boxShadow: SHADOWS.CARD,
        overflow: "hidden",
      }}
    >
      {/* Product Section */}
      {transaction.productImage && (
        <div
          style={{
            display: "flex",
            gap: SPACING.M,
            padding: SPACING.M,
            borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
          }}
        >
          <img
            src={transaction.productImage}
            alt={transaction.productName || "Product"}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: BORDER_RADIUS.MEDIUM,
            }}
          />
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                marginBottom: SPACING.S,
              }}
            >
              {transaction.productName || `Product #${transaction.productId}`}
            </h4>
            {transaction.winningBid && (
              <p
                style={{
                  fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                ${transaction.winningBid.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}

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
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              color: COLORS.PEBBLE,
            }}
          >
            Transaction ID
          </span>
          <span
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            #{transaction.id}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: SPACING.M,
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              color: COLORS.PEBBLE,
            }}
          >
            Status
          </span>
          <span
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
              color:
                transaction.status === "COMPLETED"
                  ? "#16A34A"
                  : transaction.status === "CANCELLED" ||
                    transaction.status === "PAYMENT_REJECTED"
                  ? "#DC2626"
                  : COLORS.MIDNIGHT_ASH,
              backgroundColor:
                transaction.status === "COMPLETED"
                  ? "#F0FDF4"
                  : transaction.status === "CANCELLED" ||
                    transaction.status === "PAYMENT_REJECTED"
                  ? "#FEF2F2"
                  : COLORS.SOFT_CLOUD,
              padding: `${SPACING.S} ${SPACING.M}`,
              borderRadius: BORDER_RADIUS.FULL,
            }}
          >
            {transaction.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Parties */}
        <div
          style={{
            backgroundColor: COLORS.SOFT_CLOUD,
            padding: SPACING.M,
            borderRadius: BORDER_RADIUS.MEDIUM,
            marginBottom: SPACING.M,
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
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.PEBBLE,
              }}
            >
              Buyer
            </span>
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              {transaction.buyerName || transaction.buyerId}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.PEBBLE,
              }}
            >
              Seller
            </span>
            <span
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              {transaction.sellerName || transaction.sellerId}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        {transaction.winningBid && (
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
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: COLORS.PEBBLE,
                }}
              >
                Winning Bid
              </span>
              <span
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                ${transaction.winningBid.toFixed(2)}
              </span>
            </div>
            {transaction.deliveryAddress?.deliveryMethod && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: SPACING.S,
                }}
              >
                <span
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    color: COLORS.PEBBLE,
                  }}
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
                  {transaction.deliveryAddress.deliveryMethod.price}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: SPACING.S,
                borderTop: `1px solid ${COLORS.MORNING_MIST}`,
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
                $
                {(
                  transaction.winningBid +
                  (parseFloat(
                    transaction.deliveryAddress?.deliveryMethod?.price?.replace(
                      "$",
                      ""
                    )
                  ) || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
