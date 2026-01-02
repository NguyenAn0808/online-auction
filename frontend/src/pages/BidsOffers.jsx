import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import BidOfferCard from "../components/BidOfferCard";
import FeedbackModal from "../components/FeedbackModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { listTransactions } from "../services/transactionService";
import { winListService } from "../services/winListService";
import { ratingService } from "../services/ratingService";
import { ORDER_STATUS } from "../services/orderService";
import { productService } from "../services/productService";
import api from "../services/api";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

// Helper function to format product data for BidOfferCard
function formatProductForCard(product, type = "bid") {
  const productId = product._id || product.id || product.product_id;
  const productName = product.name || product.productName || "Unnamed Product";
  const imageSrc =
    product.thumbnail ||
    product.productImage ||
    product.images?.[0]?.image_url ||
    product.images?.[0]?.src ||
    "/images/sample.jpg";
  const price =
    product.final_price ||
    product.current_price ||
    product.finalPrice ||
    product.start_price ||
    0;
  const endTime =
    product.end_time || product.endTime
      ? new Date(product.end_time || product.endTime).toLocaleDateString()
      : null;

  return {
    id: productId,
    name: productName,
    imageSrc,
    status: type === "won" ? "Won" : type === "lost" ? "Lost" : "Active",
    amount: typeof price === "number" ? price.toFixed(2) : price,
    endTime: endTime || "N/A",
    type,
    // Include extra data for won items (order info)
    orderId: product.id,
    sellerName: product.sellerName,
    orderStatus: product.status,
  };
}

// Helper function to format won order data for BidOfferCard
function formatWonOrderForCard(order) {
  return {
    id: order.product_id,
    orderId: order.id,
    name: order.productName || "Won Item",
    imageSrc: order.productImage || "/images/sample.jpg",
    status: "Won",
    amount: order.final_price ? Number(order.final_price).toFixed(2) : "N/A",
    endTime: order.endTime
      ? new Date(order.endTime).toLocaleDateString()
      : "N/A",
    type: "won",
    sellerName: order.sellerName,
    orderStatus: order.status,
  };
}

export default function BidsOffers() {
  const { user } = useAuth();
  const toast = useToast();
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    item: null,
  });
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txError, setTxError] = useState(null);
  const [activeBids, setActiveBids] = useState([]);
  const [wonItems, setWonItems] = useState([]);
  const [loadingWon, setLoadingWon] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const navigate = useNavigate();

  const handleViewAuction = (item) => {
    if (!item || !item.id) {
      console.error("Cannot navigate: item or item.id is missing", item);
      return;
    }
    // Navigate to product details page
    navigate(`/products/${item.id}`);
  };

  const handleFeedback = (item) => {
    setFeedbackModal({
      isOpen: true,
      item,
    });
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      if (!user?.id || !feedbackData.item?.id) {
        toast.error("Missing user or item information");
        return;
      }

      // Create rating using ratingService
      await ratingService.createRating({
        user_id: feedbackData.sellerId || feedbackData.item.sellerId,
        reviewer_id: user.id,
        product_id: feedbackData.item.id,
        is_positive: feedbackData.rating > 0,
        comment: feedbackData.comment || "",
      });

      toast.success("Feedback submitted successfully!");
      closeFeedbackModal();
      // Optionally refresh data
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      item: null,
    });
  };

  // Fetch transactions (for transaction history section)
  useEffect(() => {
    let mounted = true;
    async function fetchTx() {
      try {
        setLoadingTx(true);
        const data = await listTransactions();
        if (!mounted) return;
        setTransactions(Array.isArray(data) ? data : []);
        setTxError(null);
      } catch (err) {
        console.error("Failed to load transactions:", err);
        if (!mounted) return;
        setTxError("Failed to load transactions");
      } finally {
        if (mounted) setLoadingTx(false);
      }
    }
    fetchTx();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch won items from /api/orders/won
  useEffect(() => {
    let mounted = true;
    async function fetchWonItems() {
      try {
        setLoadingWon(true);
        const data = await winListService.getWinList();
        if (!mounted) return;

        // Format won orders for BidOfferCard
        const formatted = Array.isArray(data)
          ? data.map((order) => formatWonOrderForCard(order))
          : [];
        setWonItems(formatted);
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("Win-list endpoint not implemented yet");
          setWonItems([]);
        } else {
          console.error("Failed to load won items:", err);
          setWonItems([]);
        }
        if (!mounted) return;
      } finally {
        if (mounted) setLoadingWon(false);
      }
    }
    fetchWonItems();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user's bids to determine ongoing auctions
  useEffect(() => {
    let mounted = true;
    async function fetchUserBids() {
      try {
        setLoadingBids(true);
        const res = await api.get("/api/bids/user");
        if (!mounted) return;
        const bids = res.data?.data || res.data || [];
        setMyBids(Array.isArray(bids) ? bids : []);
      } catch (err) {
        console.error("Failed to load user bids:", err);
        if (!mounted) return;
        setMyBids([]);
      } finally {
        if (mounted) setLoadingBids(false);
      }
    }
    fetchUserBids();
    return () => {
      mounted = false;
    };
  }, []);

  // Build active and lost lists from user's bids with product details
  useEffect(() => {
    async function buildBidLists() {
      if (!myBids.length) {
        setActiveBids([]);
        setLostItems([]);
        return;
      }

      // Gather unique product IDs from bids
      const productIds = Array.from(
        new Set(
          myBids
            .map((b) => b.product_id || b.productId || b.product?.id)
            .filter(Boolean)
        )
      );

      // Fetch product details to get end_time and names
      let productMap = {};
      try {
        const results = await Promise.all(
          productIds.map((pid) =>
            productService
              .getProductById(pid)
              .then((p) => ({ pid, p }))
              .catch(() => ({ pid, p: null }))
          )
        );
        results.forEach(({ pid, p }) => {
          productMap[pid] = p;
        });
      } catch (e) {
        console.warn("Failed to load some product details", e);
      }

      const now = new Date();
      const active = [];
      const lost = [];

      productIds.forEach((pid) => {
        const product = productMap[pid] || {};
        const endTime = product.end_time ? new Date(product.end_time) : null;
        const isActive = endTime ? endTime > now : true; // assume active if missing end_time
        const won = wonItems.some((w) => w.id === pid);
        const name = product.name || product.productName || "Unnamed Product";
        const thumbnail =
          product.thumbnail ||
          product.productImage ||
          product.images?.[0]?.image_url ||
          "/images/sample.jpg";

        const card = formatProductForCard(
          {
            _id: pid,
            id: pid,
            name,
            thumbnail,
            end_time: product.end_time,
            current_price: product.current_price,
          },
          isActive ? "bid" : "lost"
        );

        if (isActive && !won) active.push(card);
        if (!isActive && !won) lost.push(card);
      });

      setActiveBids(active);
      setLostItems(lost);
    }

    buildBidLists();
  }, [myBids, wonItems]);

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
                  {loadingBids ? (
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
                      Loading your bids...
                    </div>
                  ) : activeBids.length === 0 ? (
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
                    activeBids.map((bid) => (
                      <BidOfferCard
                        key={bid.id}
                        {...bid}
                        onAction={handleViewAuction}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Transaction History Section */}
              <section>
                <h2
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    marginBottom: SPACING.M,
                  }}
                >
                  TRANSACTION HISTORY
                </h2>

                {loadingTx ? (
                  <div className="text-gray-500">Loading transactions...</div>
                ) : txError ? (
                  <div className="text-red-500">{txError}</div>
                ) : transactions.length === 0 ? (
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
                    No transactions found
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: SPACING.S,
                    }}
                  >
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: COLORS.WHITE,
                          border: `1px solid ${COLORS.MORNING_MIST}`,
                          padding: SPACING.M,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          cursor: "pointer",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            {tx.productName ||
                              `Transaction ${tx.id.slice(0, 8)}`}
                          </div>
                          <div
                            style={{
                              marginTop: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleDateString()
                              : "-"}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            $
                            {tx.current_price
                              ? Number(tx.current_price).toFixed(2)
                              : "N/A"}
                          </div>
                          <div
                            style={{
                              marginTop: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color:
                                tx.status === "completed"
                                  ? "#16a34a"
                                  : tx.status === "cancelled"
                                  ? "#dc2626"
                                  : "#b45309",
                            }}
                          >
                            {tx.status || "Unknown"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  {loadingWon ? (
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
                      Loading won items...
                    </div>
                  ) : wonItems.length === 0 ? (
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
                    wonItems.map((item) => (
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
                  {lostItems.length === 0 ? (
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
                    lostItems.map((lost) => (
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
