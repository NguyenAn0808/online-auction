"use client";

import { useMemo, useEffect, useState } from "react";
import Notification from "./Notification";
import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Replace this with real auth in your app
const CURRENT_USER_NAME = "Alex Smith";

// demo ratings for bidders (would come from user service)
const bidderRatings = {
  "Jane Cooper": 4.5,
  "John Doe": 4.2,
  "Alex Smith": 4.0,
  "Lisa Wong": 4.8,
};

function useBids() {
  const [bids, setBids] = useState([]);
  useEffect(() => {
    setBids(productService.getBidHistory());
  }, []);
  return bids;
}

function maskName(fullName) {
  if (!fullName) return "-";
  if (fullName === CURRENT_USER_NAME) return "You";
  const parts = fullName.trim().split(" ");
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    return `**** ${last}`;
  }
  // single name: show first char and mask rest
  if (fullName.length <= 1) return "*";
  return `${fullName.charAt(0)}***`;
}

export default function BidHistory() {
  const bids = useBids();
  const sorted = useMemo(
    () => [...bids].sort((a, b) => b.amount - a.amount),
    [bids]
  );
  const highest = sorted[0];
  const isCurrentUserHighest = highest && highest.name === CURRENT_USER_NAME;

  function renderRating(rating) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: COLORS.PEBBLE }}>
          {rating.toFixed(1)} stars
        </span>
        <span style={{ fontSize: TYPOGRAPHY.SIZE_LABEL, color: "#FBBF24" }}>
          ★
        </span>
      </div>
    );
  }

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
          <p
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              color: COLORS.PEBBLE,
              margin: 0,
            }}
          >
            Latest bids for this auction. Bidder names are masked for privacy.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING.M,
          }}
        >
          {isCurrentUserHighest ? (
            <Notification />
          ) : (
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
                ${highest?.amount?.toFixed(2)}
              </span>
            </div>
          )}
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
                Amount
              </th>
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
                Rating
              </th>
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
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((bid, idx) => {
              const isHighest = idx === 0;
              return (
                <tr
                  key={bid.id}
                  style={{
                    backgroundColor: isHighest
                      ? COLORS.SOFT_CLOUD
                      : COLORS.WHITE,
                    borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.SOFT_CLOUD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isHighest
                      ? COLORS.SOFT_CLOUD
                      : COLORS.WHITE;
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
                          color: isHighest
                            ? COLORS.MIDNIGHT_ASH
                            : COLORS.MIDNIGHT_ASH,
                        }}
                      >
                        {maskName(bid.name)}{" "}
                        {isHighest ? (
                          <span
                            style={{
                              marginLeft: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: "#4F46E5",
                            }}
                          >
                            (Highest)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
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
                    ${bid.amount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                    }}
                  >
                    {bidderRatings[bid.name] ? (
                      renderRating(bidderRatings[bid.name])
                    ) : (
                      <span
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        No rating
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: SPACING.M,
                      paddingBottom: SPACING.M,
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {new Date(bid.time).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
