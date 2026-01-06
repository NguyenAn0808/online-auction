import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ratingService } from "../services/ratingService";
import api from "../services/api";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowLeftIcon,
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
    reviewer:
      rating.reviewer_name ||
      rating.reviewer?.full_name ||
      rating.reviewer?.username ||
      "Anonymous",
    rating:
      typeof rating.score === "number"
        ? rating.score >= 1
          ? 1
          : -1
        : rating.is_positive
        ? 1
        : -1,
    comment: rating.comment || "",
    date:
      rating.created_at || rating.createdAt
        ? new Date(rating.created_at || rating.createdAt).toLocaleDateString(
            "vi-VN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          )
        : "",
    productName: rating.product_name || rating.product?.name || "Auction Item",
  };
}

export default function RatingsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [filterRating, setFilterRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Fetch user info
  useEffect(() => {
    async function fetchUserInfo() {
      if (!userId) return;
      try {
        const response = await api.get(`/api/users/${userId}`);
        const data = response.data?.data || response.data;
        setUserInfo(data);
      } catch (err) {
        console.warn("Could not fetch user info:", err);
        // Not critical - continue without user info
      }
    }
    fetchUserInfo();
  }, [userId]);

  // Fetch ratings
  useEffect(() => {
    async function fetchRatings() {
      if (!userId) {
        setLoading(false);
        setError("No user specified");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch ratings
        const ratingsData = await ratingService.getUserRatings(userId);

        // Handle backend response format
        const ratingsList = ratingsData?.data
          ? Array.isArray(ratingsData.data)
            ? ratingsData.data
            : []
          : ratingsData?.ratings
          ? Array.isArray(ratingsData.ratings)
            ? ratingsData.ratings
            : []
          : Array.isArray(ratingsData)
          ? ratingsData
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
  }, [userId]);

  const filteredFeedback =
    filterRating === null
      ? ratings
      : ratings.filter((f) => f.rating === filterRating);

  const thumbsUpCount = ratings.filter((f) => f.rating === 1).length;
  const thumbsDownCount = ratings.filter((f) => f.rating === -1).length;
  const totalRatings = ratings.length;
  const ratingPercentage =
    totalRatings > 0 ? Math.round((thumbsUpCount / totalRatings) * 100) : 0;

  // Determine user display name
  const displayName =
    userInfo?.full_name ||
    userInfo?.fullName ||
    userInfo?.username ||
    userInfo?.email?.split("@")[0] ||
    "User";

  return (
    <div style={{ backgroundColor: COLORS.WHISPER, minHeight: "100vh" }}>
      <Header />

      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: SPACING.L }}
        className="px-4 sm:px-6 lg:px-8 mt-6"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: COLORS.PEBBLE,
            fontSize: TYPOGRAPHY.SIZE_BODY,
          }}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>

        {/* User Header Card */}
        <div
          style={{
            backgroundColor: COLORS.WHITE,
            borderRadius: BORDER_RADIUS.MEDIUM,
            boxShadow: SHADOWS.SUBTLE,
            padding: SPACING.L,
            marginBottom: SPACING.L,
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl"
              style={{
                backgroundColor: COLORS.MORNING_MIST,
                color: COLORS.PEBBLE,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1
                style={{
                  fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                  color: COLORS.MIDNIGHT_ASH,
                  marginBottom: SPACING.XS,
                }}
              >
                {displayName}
              </h1>
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  color: COLORS.PEBBLE,
                }}
              >
                {userInfo?.role
                  ? userInfo.role.charAt(0).toUpperCase() +
                    userInfo.role.slice(1)
                  : "Member"}
              </div>
            </div>

            {/* Rating Score Badge */}
            {totalRatings > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: SPACING.M,
                  backgroundColor:
                    ratingPercentage >= 80
                      ? "#EAF7EF"
                      : ratingPercentage >= 50
                      ? "#FEF3C7"
                      : "#FBEAEC",
                  borderRadius: BORDER_RADIUS.MEDIUM,
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color:
                      ratingPercentage >= 80
                        ? "#6CA977"
                        : ratingPercentage >= 50
                        ? "#D97706"
                        : "#C85A54",
                  }}
                >
                  {ratingPercentage}%
                </div>
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    color: COLORS.PEBBLE,
                  }}
                >
                  Positive
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Summary Card */}
        <div
          style={{
            backgroundColor: COLORS.WHITE,
            borderRadius: BORDER_RADIUS.MEDIUM,
            boxShadow: SHADOWS.SUBTLE,
            padding: SPACING.L,
            marginBottom: SPACING.L,
          }}
        >
          <h2
            style={{
              fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
              fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
              color: COLORS.MIDNIGHT_ASH,
              marginBottom: SPACING.M,
            }}
          >
            Rating Summary
          </h2>

          {/* Rating Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: SPACING.M,
            }}
          >
            {/* Total Feedback */}
            <div
              style={{
                backgroundColor: COLORS.SOFT_CLOUD,
                border: `1px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.MEDIUM,
                padding: SPACING.M,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                {totalRatings}
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: COLORS.PEBBLE,
                  marginTop: SPACING.XS,
                }}
              >
                Total
              </div>
            </div>

            {/* Positive Ratings */}
            <div
              style={{
                backgroundColor: "#EAF7EF",
                border: `1px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.MEDIUM,
                padding: SPACING.M,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-80"
              onClick={() => setFilterRating(filterRating === 1 ? null : 1)}
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
                    height: "20px",
                    width: "20px",
                    color: "#6CA977",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: "#6CA977",
                    }}
                  >
                    {thumbsUpCount}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: "#6CA977",
                  textAlign: "center",
                  marginTop: SPACING.XS,
                }}
              >
                Positive
              </div>
            </div>

            {/* Negative Ratings */}
            <div
              style={{
                backgroundColor: "#FBEAEC",
                border: `1px solid ${COLORS.MORNING_MIST}`,
                borderRadius: BORDER_RADIUS.MEDIUM,
                padding: SPACING.M,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-80"
              onClick={() => setFilterRating(filterRating === -1 ? null : -1)}
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
                    height: "20px",
                    width: "20px",
                    color: "#C85A54",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: "#C85A54",
                    }}
                  >
                    {thumbsDownCount}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: "#C85A54",
                  textAlign: "center",
                  marginTop: SPACING.XS,
                }}
              >
                Negative
              </div>
            </div>
          </div>

          {/* Filter Info */}
          {filterRating !== null && (
            <div
              style={{
                marginTop: SPACING.M,
                padding: SPACING.S,
                backgroundColor: "#D1ECF1",
                borderRadius: BORDER_RADIUS.SMALL,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: "#0C5460",
                }}
              >
                {filterRating === 1
                  ? "Showing positive feedback only"
                  : "Showing negative feedback only"}
              </span>
              <button
                onClick={() => setFilterRating(null)}
                style={{
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: "#0C5460",
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                className="hover:opacity-70"
              >
                Clear
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
              padding: SPACING.M,
              borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
            }}
          >
            <h2
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                color: COLORS.MIDNIGHT_ASH,
              }}
            >
              Feedback ({filteredFeedback.length})
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
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
                {filterRating !== null
                  ? "No matching feedback found"
                  : "No feedback yet"}
              </div>
            ) : (
              filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  style={{
                    padding: SPACING.M,
                    borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                    transition: "background-color 0.2s ease",
                  }}
                  className="hover:bg-gray-50"
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: SPACING.S,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.S,
                          marginBottom: SPACING.XS,
                        }}
                      >
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          {feedback.reviewer}
                        </span>
                        <span
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            color: COLORS.PEBBLE,
                          }}
                        >
                          • {feedback.date}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        {feedback.productName}
                      </p>
                    </div>

                    {/* Rating Thumb */}
                    <div
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING.XS,
                        padding: `${SPACING.XS} ${SPACING.S}`,
                        borderRadius: BORDER_RADIUS.SMALL,
                        backgroundColor:
                          feedback.rating === 1 ? "#EAF7EF" : "#FBEAEC",
                      }}
                    >
                      {feedback.rating === 1 ? (
                        <>
                          <HandThumbUpIcon
                            style={{
                              height: "16px",
                              width: "16px",
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
                              height: "16px",
                              width: "16px",
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

                  {/* Comment */}
                  {feedback.comment && (
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        borderLeft: `3px solid ${COLORS.MORNING_MIST}`,
                        paddingLeft: SPACING.S,
                        marginTop: SPACING.S,
                      }}
                    >
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
