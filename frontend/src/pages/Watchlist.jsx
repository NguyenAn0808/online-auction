import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import {
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlistService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Reusable WatchlistItemCard component
function WatchlistItemCard({ item, onRemove, onNavigate }) {
  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (
      e.target.closest("button") ||
      e.target.closest('[data-no-navigate="true"]')
    ) {
      return;
    }
    onNavigate(item.id);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(item.id);
  };

  // Format price with Vietnamese locale
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toLocaleString("vi-VN");
  };

  // Calculate USD equivalent (example rate)
  const usdPrice = item.price ? (item.price / 24000).toFixed(2) : null;

  // Action handlers (stubs for now)
  const handleBuyNow = (e) => {
    e.stopPropagation();
    console.log("Buy Now clicked for item:", item);
    onNavigate(item.id);
  };

  const handleVisitStore = (e) => {
    e.stopPropagation();
    console.log("Visit Store clicked for item:", item);
    // TODO: Navigate to seller's store
  };

  const handleContactSeller = (e) => {
    e.stopPropagation();
    console.log("Contact Seller clicked for item:", item);
    // TODO: Open chat/contact modal
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.WHITE,
        border: `1px solid rgba(179, 191, 185, 0.2)`,
        borderRadius: BORDER_RADIUS.MEDIUM,
        boxShadow: SHADOWS.SUBTLE,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="hover:shadow-light hover:scale-101"
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
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
            src={item.imageSrc || "/images/sample.jpg"}
            alt={item.name}
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
              {item.name || "Untitled Item"}
            </h3>

            {/* Condition */}
            <p
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                color: COLORS.PEBBLE,
                marginBottom: SPACING.S,
              }}
            >
              {item.condition || "Good – Refurbished"}
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                color: COLORS.PEBBLE,
                marginBottom: SPACING.S,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.description ||
                "Premium quality product with excellent features. Perfect condition with original packaging."}
            </p>

            {/* Seller info */}
            <p
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.PEBBLE,
              }}
            >
              {item.sold || 413} sold · {item.watching || 1739} watching
            </p>
          </div>
        </div>

        {/* Right: Price & Actions */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: "220px",
          }}
        >
          {/* Price section */}
          <div
            style={{
              marginBottom: SPACING.L,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: SPACING.M,
            }}
          >
            <div
              style={{
                textAlign: "right",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                  color: COLORS.MIDNIGHT_ASH,
                  marginBottom: SPACING.S,
                }}
              >
                {formatPrice(item.price)} VND
              </div>
              {usdPrice && (
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    color: COLORS.PEBBLE,
                    marginBottom: SPACING.S,
                  }}
                >
                  ≈ ${usdPrice}
                </div>
              )}
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  color: COLORS.PEBBLE,
                }}
              >
                {item.timeRemaining || "2d 5h"}
              </div>
            </div>
            {/* Heart icon */}
            <button
              onClick={handleRemoveClick}
              data-no-navigate="true"
              style={{
                padding: SPACING.S,
                backgroundColor: COLORS.WHITE,
                border: `1.5px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.FULL,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="hover:opacity-90"
              aria-label="Remove from watchlist"
            >
              <HeartIconSolid
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#ef4444",
                }}
              />
            </button>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING.S,
            }}
          >
            <button
              onClick={handleBuyNow}
              data-no-navigate="true"
              style={{
                backgroundColor: COLORS.MIDNIGHT_ASH,
                color: COLORS.WHITE,
                borderRadius: BORDER_RADIUS.FULL,
                padding: `4px ${SPACING.L}`,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
              className="hover:opacity-90"
            >
              Buy It Now
            </button>
            <button
              onClick={handleVisitStore}
              data-no-navigate="true"
              style={{
                backgroundColor: COLORS.WHITE,
                color: COLORS.MIDNIGHT_ASH,
                border: `1.5px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.FULL,
                padding: `4px ${SPACING.L}`,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                cursor: "pointer",
                transition: "all 0.2s ease",
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
              className="hover:opacity-90"
            >
              Visit Store
            </button>
            <button
              onClick={handleContactSeller}
              data-no-navigate="true"
              style={{
                backgroundColor: COLORS.WHITE,
                color: COLORS.MIDNIGHT_ASH,
                border: `1.5px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.FULL,
                padding: `4px ${SPACING.L}`,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                cursor: "pointer",
                transition: "all 0.2s ease",
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
              className="hover:opacity-90"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWatchlist() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getWatchlist(user.id);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setError("Failed to load watchlist");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, [user]);

  const handleRemove = async (id) => {
    if (!user?.id) return;

    try {
      await removeFromWatchlist(user.id, id);
      // Update local state
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      alert("Failed to remove item from watchlist");
    }
  };

  const handleNavigate = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.WHISPER,
        minHeight: "100vh",
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: SPACING.M,
        }}
        className="mx-auto px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block" style={{ width: "256px" }}>
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div style={{ marginBottom: SPACING.L }}>
              <Tabs />
            </div>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: SPACING.XXL,
                }}
              >
                <div style={{ color: COLORS.PEBBLE }}>Loading watchlist...</div>
              </div>
            ) : error ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "100%", maxWidth: "672px" }}>
                  <div
                    style={{
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      border: `2px dashed ${COLORS.MORNING_MIST}`,
                      backgroundColor: COLORS.WHITE,
                      padding: SPACING.L,
                      textAlign: "center",
                      color: "#dc2626",
                    }}
                  >
                    {error}
                  </div>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "100%", maxWidth: "672px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      border: `2px dashed ${COLORS.MORNING_MIST}`,
                      backgroundColor: COLORS.WHITE,
                      paddingTop: SPACING.XXL,
                      paddingBottom: SPACING.XXL,
                      paddingLeft: SPACING.L,
                      paddingRight: SPACING.L,
                      textAlign: "center",
                      boxShadow: SHADOWS.SUBTLE,
                    }}
                  >
                    <HeartIcon
                      style={{
                        height: "64px",
                        width: "64px",
                        color: "#ef4444",
                        marginBottom: SPACING.L,
                      }}
                    />
                    <h2
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LARGE_TITLE,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                        marginBottom: SPACING.M,
                      }}
                    >
                      You have no items in your Watchlist.
                    </h2>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                        maxWidth: "100%",
                      }}
                    >
                      Start adding items to your Watchlist today! Simply tap
                      <span style={{ fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD }}>
                        {" 'Add to watchlist' "}
                      </span>
                      next to the item you want to keep a close eye on.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: SPACING.S,
                }}
              >
                {items.map((item) => (
                  <WatchlistItemCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
