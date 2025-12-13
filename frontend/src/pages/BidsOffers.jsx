import React, { useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import BidOfferCard from "../components/BidOfferCard";
import FeedbackModal from "../components/FeedbackModal";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const demoBids = [
  {
    id: 1,
    name: "Zip Tote Basket",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg",
    status: "Highest Bid",
    amount: "275.00",
    endTime: "2d 4h",
    type: "bid",
  },
  {
    id: 2,
    name: "Canvas Weekend Bag",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-02.jpg",
    status: "Outbid",
    amount: "120.00",
    endTime: "5h 12m",
    type: "bid",
  },
];

const demoWon = [
  {
    id: 31,
    name: "Waxed Canvas Backpack",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-04.jpg",
    status: "Won",
    amount: "89.99",
    endTime: "Nov 15",
    type: "won",
  },
];

const demoLost = [
  {
    id: 21,
    name: "Classic Leather Satchel",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-01.jpg",
    status: "Lost",
    amount: "95.00",
    endTime: "Nov 10",
    type: "lost",
  },
];

export default function BidsOffers() {
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    item: null,
  });

  const handleViewAuction = (item) => {
    console.log("View auction/item:", item);
  };

  const handleFeedback = (item) => {
    setFeedbackModal({
      isOpen: true,
      item,
    });
  };

  const handleSubmitFeedback = async (feedbackData) => {
    console.log("Feedback submitted:", feedbackData);
    alert("Feedback submitted successfully!");
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      item: null,
    });
  };

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

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div style={{ marginBottom: SPACING.L }}>
              <Tabs />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.XL,
              }}
            >
              {/* Bidding Section */}
              <section>
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    marginBottom: SPACING.M,
                  }}
                >
                  ONGOING
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.S,
                  }}
                >
                  {demoBids.length === 0 ? (
                    <div
                      style={{
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `2px dashed ${COLORS.MORNING_MIST}`,
                        backgroundColor: COLORS.WHITE,
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      No active bids
                    </div>
                  ) : (
                    demoBids.map((bid) => (
                      <BidOfferCard
                        key={bid.id}
                        {...bid}
                        onAction={handleViewAuction}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Won Items Section */}
              <section>
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    marginBottom: SPACING.M,
                  }}
                >
                  WON ITEMS
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.S,
                  }}
                >
                  {demoWon.length === 0 ? (
                    <div
                      style={{
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `2px dashed ${COLORS.MORNING_MIST}`,
                        backgroundColor: COLORS.WHITE,
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      You haven't won any items yet
                    </div>
                  ) : (
                    demoWon.map((item) => (
                      <BidOfferCard
                        key={item.id}
                        {...item}
                        onFeedback={handleFeedback}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Didn't Win Section */}
              <section>
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    marginBottom: SPACING.M,
                  }}
                >
                  NOT WIN
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.S,
                  }}
                >
                  {demoLost.length === 0 ? (
                    <div
                      style={{
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `2px dashed ${COLORS.MORNING_MIST}`,
                        backgroundColor: COLORS.WHITE,
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      No lost items
                    </div>
                  ) : (
                    demoLost.map((lost) => (
                      <BidOfferCard
                        key={lost.id}
                        {...lost}
                        onAction={handleViewAuction}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        item={feedbackModal.item}
        onSubmit={handleSubmitFeedback}
        onClose={closeFeedbackModal}
      />
    </div>
  );
}
