import React from "react";
import Header from "../components/Header";
import BidHistory from "../components/BidHistory";
import BidProduct from "../components/BidProduct";
import { COLORS, SPACING } from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";

export const BiddingPage = () => {
  const { user } = useAuth();

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

          {/* Only render the container (border & spacing) if user is logged in */}
          {user && (
            <div
              style={{
                marginTop: SPACING.XXL,
                paddingTop: SPACING.XXL,
                borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
              }}
            >
              <BidHistory />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BiddingPage;
