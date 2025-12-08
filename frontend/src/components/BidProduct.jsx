import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BiddingQuickView from "./BiddingQuickView";
import {
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Demo product(s)
const products = [
  {
    id: 1,
    name: "Nomad Tumbler",
    description:
      "This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.",
    href: "#",
    price: "35.00",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-01.jpg",
    imageAlt: "Insulated bottle with white base and black snap lid.",
    // demo auction due time: 2 days from now
    dueTime: new Date(Date.now()).toISOString(),
  },
];

// Demo bids and current user (replace with API/auth in real app)
const bids = [
  { id: 1, name: "Jane Cooper", time: "1 hour ago", amount: 200.0 },
  { id: 2, name: "John Doe", time: "2 hours ago", amount: 250.0 },
  { id: 3, name: "Alex Smith", time: "3 hours ago", amount: 180.0 },
  { id: 4, name: "Lisa Wong", time: "30 minutes ago", amount: 275.0 },
];
const CURRENT_USER_NAME = "Lisa Wong";

export default function BidProduct() {
  const [showQuickView, setShowQuickView] = useState(false);
  const navigate = useNavigate();

  const highest = useMemo(() => {
    return bids.slice().sort((a, b) => b.amount - a.amount)[0];
  }, []);

  return (
    <>
      <div style={{ marginBottom: SPACING.XXL }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: SPACING.M,
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontSize: TYPOGRAPHY.SIZE_HEADING_XL,
              fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            Bidding History
          </h1>
          <div style={{ fontSize: TYPOGRAPHY.SIZE_BODY, color: COLORS.PEBBLE }}>
            Time left:{" "}
            <span
              style={{
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              2 days
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: SPACING.XXL }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              backgroundColor: COLORS.WHITE,
              border: `1px solid ${COLORS.MORNING_MIST}`,
              borderRadius: BORDER_RADIUS.MEDIUM,
              boxShadow: SHADOWS.SUBTLE,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: SPACING.L,
                padding: SPACING.L,
              }}
            >
              {/* Product Image & Summary */}
              <div
                style={{
                  display: "flex",
                  gap: SPACING.M,
                }}
              >
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  style={{
                    aspectRatio: "1",
                    width: "160px",
                    height: "160px",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h3
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    <a href={product.href}>{product.name}</a>
                  </h3>
                  <p
                    style={{
                      marginTop: SPACING.S,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    ${product.price}
                  </p>
                  <p
                    style={{
                      marginTop: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Summary Info & Action */}
              <div
                style={{
                  display: "grid",
                  gap: SPACING.M,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Delivery Address
                  </p>
                  <p
                    style={{
                      marginTop: SPACING.S,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Floyd Miles
                    <br />
                    7363 Cynthia Pass
                    <br />
                    Toronto, ON
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Current Max Bid
                  </p>
                  <div
                    style={{
                      marginTop: SPACING.S,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      ${highest.amount.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowQuickView(true)}
                      style={{
                        padding: `6px ${SPACING.M}`,
                        borderRadius: BORDER_RADIUS.FULL,
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        border: "none",
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.target.style.opacity = "1")}
                    >
                      Increase max bid
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Auction result actions - show only after auction ended */}
            {(() => {
              const now = Date.now();
              const ended = now > new Date(product.dueTime).getTime();
              if (!ended) return null;
              const highestLocal = bids
                .slice()
                .sort((a, b) => b.amount - a.amount)[0];
              const isWinner =
                highestLocal && highestLocal.name === CURRENT_USER_NAME;

              return (
                <div
                  style={{
                    borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                    padding: SPACING.L,
                  }}
                >
                  <div
                    style={{
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      border: `1px solid ${isWinner ? "#dcfce7" : "#fee2e2"}`,
                      backgroundColor: isWinner ? "#f0fdf4" : "#fef2f2",
                      padding: SPACING.M,
                    }}
                  >
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: isWinner ? "#15803d" : "#991b1b",
                      }}
                    >
                      {isWinner
                        ? "✓ Congrats, you won!"
                        : "Good luck next time!"}
                    </p>

                    <div
                      style={{
                        marginTop: SPACING.M,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: SPACING.S,
                      }}
                    >
                      {isWinner && (
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${product.id}`)}
                          aria-label="Pay now"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: SPACING.S,
                            borderRadius: BORDER_RADIUS.FULL,
                            backgroundColor: "#16a34a",
                            color: COLORS.WHITE,
                            padding: `6px ${SPACING.M}`,
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            border: "none",
                            cursor: "pointer",
                            transition: "opacity 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "0.9")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                        >
                          <CurrencyDollarIcon
                            style={{ width: "16px", height: "16px" }}
                          />
                          Pay now
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => alert("Contact seller (placeholder)")}
                        aria-label="Contact seller"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: SPACING.S,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1px solid ${COLORS.MORNING_MIST}`,
                          padding: `6px ${SPACING.M}`,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            COLORS.SOFT_CLOUD;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.WHITE;
                        }}
                      >
                        <ChatBubbleLeftRightIcon
                          style={{ width: "16px", height: "16px" }}
                        />
                        Contact seller
                      </button>

                      <button
                        type="button"
                        onClick={() => alert("Leave feedback (placeholder)")}
                        aria-label="Leave feedback"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: SPACING.S,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1px solid ${COLORS.MORNING_MIST}`,
                          padding: `6px ${SPACING.M}`,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            COLORS.SOFT_CLOUD;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.WHITE;
                        }}
                      >
                        <StarIcon style={{ width: "16px", height: "16px" }} />
                        Leave feedback
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          alert("Sell one like this (placeholder)")
                        }
                        aria-label="Sell one like this"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: SPACING.S,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1px solid ${COLORS.MORNING_MIST}`,
                          padding: `6px ${SPACING.M}`,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            COLORS.SOFT_CLOUD;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.WHITE;
                        }}
                      >
                        <ShoppingBagIcon
                          style={{ width: "16px", height: "16px" }}
                        />
                        Sell one like this
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Auction Status Progress */}
            <div
              style={{
                borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                padding: SPACING.L,
              }}
            >
              <p
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Auction Status
              </p>

              {/* Time-progress until dueTime */}
              {(() => {
                const now = Date.now();
                const due = new Date(product.dueTime).getTime();
                // assume auction started 2 days before now (demo)
                const start = now - 2 * 24 * 60 * 60 * 1000;
                const total = Math.max(1, due - start);
                const elapsed = Math.max(0, Math.min(now - start, total));
                const percent = Math.round((elapsed / total) * 100);

                const highestLocal = bids
                  .slice()
                  .sort((a, b) => b.amount - a.amount)[0];
                const isCurrentUserHighest =
                  highestLocal && highestLocal.name === CURRENT_USER_NAME;
                const barColor = isCurrentUserHighest ? "#16a34a" : "#dc2626";

                const msLeft = Math.max(0, due - now);
                const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
                const hours = Math.floor(
                  (msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
                );

                return (
                  <div style={{ marginTop: SPACING.M }}>
                    <div
                      style={{
                        overflow: "hidden",
                        borderRadius: BORDER_RADIUS.FULL,
                        backgroundColor: COLORS.SOFT_CLOUD,
                        height: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          backgroundColor: barColor,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: SPACING.M,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: isCurrentUserHighest ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {isCurrentUserHighest
                          ? "✓ You are the highest bidder"
                          : "You are not the highest bidder"}
                      </span>
                      <span>
                        Time left: {days > 0 ? `${days}d ` : ""}
                        {hours}h
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* controlled quick view modal for this product */}
              <BiddingQuickView
                open={showQuickView}
                onClose={() => setShowQuickView(false)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
