import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { ratingService } from "../services/ratingService";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Helper function to format rating data for display
function formatRating(rating) {
  return {
    id: rating._id || rating.id,
    seller: rating.reviewer?.full_name || rating.reviewer?.username || "Unknown",
    rating: rating.is_positive ? 1 : -1,
    title: rating.comment
      ? rating.comment.split(".")[0] || rating.comment.substring(0, 50)
      : "No title",
    body: rating.comment || "",
    date: rating.createdAt
      ? new Date(rating.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    transaction: `Order #${(rating.product_id || "").slice(0, 8)}`,
    itemName: rating.product?.name || "Unknown Item",
  };
}

export default function Ratings() {
  const { user } = useAuth();
  const [filterRating, setFilterRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRatings() {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ratingService.getUserRatings(user._id);
        // Handle backend response format: { success: true, data: [...] } or { ratings: [...] }
        const ratingsList = data?.data 
          ? (Array.isArray(data.data) ? data.data : [])
          : data?.ratings 
            ? (Array.isArray(data.ratings) ? data.ratings : [])
            : Array.isArray(data) 
              ? data 
              : [];
        setRatings(ratingsList.map(formatRating));
      } catch (err) {
        console.error("Error fetching ratings:", err);
        setError("Failed to load ratings");
        setRatings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRatings();
  }, [user]);

  const filteredFeedback =
    filterRating === null
      ? ratings
      : ratings.filter((f) => f.rating === filterRating);

  const thumbsUpCount = ratings.filter((f) => f.rating === 1).length;
  const thumbsDownCount = ratings.filter((f) => f.rating === -1).length;

  return (
    <div style={{ backgroundColor: COLORS.WHISPER, minHeight: "100vh" }}>
      <Header />

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: SPACING.M }}
        className="mx-auto px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block" style={{ width: "256px" }}>
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div style={{ marginBottom: SPACING.L }}>
              <Tabs />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.L,
              }}
            >
              {/* Rating Summary Card */}
              <div
                style={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  boxShadow: SHADOWS.SUBTLE,
                  padding: SPACING.L,
                }}
              >
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    marginBottom: SPACING.L,
                  }}
                >
                  Your Bidder Ratings
                </h2>

                {/* Rating Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: SPACING.M,
                    marginBottom: SPACING.L,
                  }}
                >
                  {/* Total Feedback */}
                  <div
                    style={{
                      backgroundColor: COLORS.SOFT_CLOUD,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      padding: SPACING.M,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {ratings.length}
                    </div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                        color: COLORS.PEBBLE,
                        marginTop: SPACING.S,
                      }}
                    >
                      Total Feedback
                    </div>
                  </div>

                  {/* Positive Ratings */}
                  <div
                    style={{
                      backgroundColor: "#D4EDDA",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      padding: SPACING.M,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    className="hover:opacity-80"
                    onClick={() =>
                      setFilterRating(filterRating === 1 ? null : 1)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: SPACING.S,
                      }}
                    >
                      <HandThumbUpIcon
                        style={{
                          height: "24px",
                          width: "24px",
                          color: "#6CA977",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            color: "#6CA977",
                          }}
                        >
                          {thumbsUpCount}
                        </div>
                        <div
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                            color: "#6CA977",
                            marginTop: SPACING.S,
                          }}
                        >
                          Positive
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Negative Ratings */}
                  <div
                    style={{
                      backgroundColor: "#F8D7DA",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      padding: SPACING.M,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    className="hover:opacity-80"
                    onClick={() =>
                      setFilterRating(filterRating === -1 ? null : -1)
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: SPACING.S,
                      }}
                    >
                      <HandThumbDownIcon
                        style={{
                          height: "24px",
                          width: "24px",
                          color: "#C85A54",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            color: "#C85A54",
                          }}
                        >
                          {thumbsDownCount}
                        </div>
                        <div
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                            color: "#C85A54",
                            marginTop: SPACING.S,
                          }}
                        >
                          Neutral
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Info */}
                {filterRating !== null && (
                  <div
                    style={{
                      marginBottom: SPACING.M,
                      padding: SPACING.M,
                      backgroundColor: "#D1ECF1",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                        color: "#0C5460",
                      }}
                    >
                      {filterRating === 1
                        ? "Showing positive feedback only"
                        : "Showing neutral feedback only"}
                    </span>
                    <button
                      onClick={() => setFilterRating(null)}
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                        color: "#0C5460",
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      className="hover:opacity-70"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback List */}
              <div
                style={{
                  backgroundColor: COLORS.WHITE,
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  boxShadow: SHADOWS.SUBTLE,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    divideY: `1px solid ${COLORS.MORNING_MIST}`,
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      Loading ratings...
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: "#dc2626",
                      }}
                    >
                      {error}
                    </div>
                  ) : filteredFeedback.length === 0 ? (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      No feedback found
                    </div>
                  ) : (
                    filteredFeedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        style={{
                          padding: SPACING.L,
                          borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                          transition: "background-color 0.2s ease",
                        }}
                        className="hover:bg-whisper"
                      >
                        {/* Header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: SPACING.M,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: SPACING.S,
                                marginBottom: SPACING.S,
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                  color: COLORS.MIDNIGHT_ASH,
                                }}
                              >
                                {feedback.seller}
                              </h3>
                              {feedback.sellerBadge && (
                                <span
                                  style={{
                                    padding: `${SPACING.S} ${SPACING.M}`,
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                    backgroundColor: "#FFF3CD",
                                    color: "#856404",
                                    borderRadius: BORDER_RADIUS.FULL,
                                  }}
                                >
                                  {feedback.sellerBadge}
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              {feedback.transaction} • {feedback.itemName}
                            </p>
                          </div>

                          {/* Rating Thumb */}
                          <div
                            style={{
                              flexShrink: 0,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: SPACING.S,
                            }}
                          >
                            {feedback.rating === 1 ? (
                              <>
                                <HandThumbUpIcon
                                  style={{
                                    height: "24px",
                                    width: "24px",
                                    color: "#6CA977",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                    color: "#6CA977",
                                  }}
                                >
                                  +1
                                </span>
                              </>
                            ) : (
                              <>
                                <HandThumbDownIcon
                                  style={{
                                    height: "24px",
                                    width: "24px",
                                    color: "#C85A54",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                    color: "#C85A54",
                                  }}
                                >
                                  -1
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.S,
                          }}
                        >
                          {feedback.title}
                        </h4>

                        {/* Body */}
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            color: COLORS.PEBBLE,
                            marginBottom: SPACING.M,
                          }}
                        >
                          {feedback.body}
                        </p>

                        {/* Footer */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            color: COLORS.PEBBLE,
                          }}
                        >
                          <span>{feedback.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
