import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import { HeartIcon } from "@heroicons/react/24/outline";
import {
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlistService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

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

  const toProductCardShape = (item) => {
    const id = item?.id ?? item?.product_id ?? item?._id;
    const thumbnail =
      item?.thumbnail ||
      item?.imageSrc ||
      item?.image_url ||
      "/images/sample.jpg";

    return {
      id,
      name: item?.name || item?.product_name || "Untitled Item",
      current_price:
        item?.current_price ?? item?.price ?? item?.start_price ?? 0,
      start_price: item?.start_price ?? item?.price ?? 0,
      buy_now_price: item?.buy_now_price ?? 0,
      bid_count: item?.bid_count ?? 0,
      highest_bidder_id: item?.highest_bidder_id ?? "N/A",
      posted_date: item?.posted_date ?? item?.start_time ?? null,
      start_time: item?.start_time ?? null,
      end_time: item?.end_time ?? null,
      thumbnail,
      images: item?.images,
    };
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
                  <ProductCard
                    key={item?.id ?? item?.product_id ?? item?._id}
                    product={toProductCardShape(item)}
                    onWatchlistChange={(productId, inWatchlist) => {
                      if (!inWatchlist) {
                        setItems((prev) =>
                          prev.filter(
                            (p) =>
                              (p?.id ?? p?.product_id ?? p?._id) !== productId
                          )
                        );
                      }
                    }}
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
