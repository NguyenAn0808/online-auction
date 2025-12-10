import React from "react";
import Header from "../components/Header";
import BidHistory from "../components/BidHistory";
import BidProduct from "../components/BidProduct";
import { COLORS, SPACING } from "../constants/designSystem";

export const BiddingPage = () => {
  return (
    <>
      <Header />
      <div style={{ backgroundColor: COLORS.WHISPER }}>
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "1400px",
            paddingLeft: SPACING.M,
            paddingRight: SPACING.M,
            paddingTop: SPACING.XXL,
            paddingBottom: SPACING.XXL,
          }}
        >
          <BidProduct />
          <div
            style={{
              marginTop: SPACING.XXL,
              paddingTop: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <BidHistory />
          </div>
        </div>
      </div>
    </>
  );
};
