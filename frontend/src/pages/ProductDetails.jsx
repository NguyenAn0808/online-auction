import React from "react";
import Header from "../components/Header";
import SimpleProductList from "../components/SimpleProductList";
import Footer from "../components/Footer";
import ProductOverview from "../components/ProductOverview";
import ProductFeatures from "../components/ProductFeatures";
import SimiliarProductsList from "../components/SimiliarProductsList";
import SellerFeedback from "../components/SellerFeedback";
import BidHistory from "../components/BidHistory";
import QuestionsHistory from "../components/QuestionsHistory";
import { COLORS, SPACING } from "../constants/designSystem";

import { useEffect } from "react";

const ProductDetails = () => {
  useEffect(() => {
    document.title = "Product Details — eBid";
  }, []);

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
          }}
        >
          {/* Product Overview Section */}
          <div>
            <ProductOverview />
          </div>

          {/* Product Features Section */}
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <ProductFeatures />
          </div>

          {/* Similar Products Section */}
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <SimiliarProductsList />
          </div>

          {/* Seller Feedback Section */}
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <SellerFeedback />
          </div>

          {/* Bid History Section */}
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <BidHistory />
          </div>

          {/* Questions History Section */}
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <QuestionsHistory />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
