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
  const endTime = product.end_time || product.endTime || null;

  return {
    id: productId,
    name: productName,
    imageSrc,
    status: type === "won" ? "Won" : type === "lost" ? "Lost" : "Active",
    amount:
      product.userBidAmount !== undefined && product.userBidAmount !== null
        ? Number(product.userBidAmount)
        : Number(price),
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
  console.log("[formatWonOrderForCard] Order data:", order);

  const formatted = {
    id: order.product_id,
    orderId: order.id,
    name: order.productName || order.product?.name || "Won Item",
    imageSrc:
      order.productImage ||
      order.product?.images?.[0]?.image_url ||
      "/images/sample.jpg",
    status: "Won",
    amount: order.final_price ? Number(order.final_price) : null,
    endTime: order.endTime
      ? new Date(order.endTime).toLocaleDateString()
      : "N/A",
    type: "won",
    sellerName:
      order.sellerName || order.seller?.full_name || order.seller?.name,
    orderStatus: order.status,
    // Try multiple possible seller ID fields
    sellerId:
      order.seller_id || order.sellerId || order.seller?.id || order.seller_id,
  };

  console.log("[formatWonOrderForCard] Formatted:", formatted);
  return formatted;
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
  const [txCards, setTxCards] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [wonItems, setWonItems] = useState([]);
  const [loadingWon, setLoadingWon] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  // Seller-specific state
  const [sellerActiveProducts, setSellerActiveProducts] = useState([]);
  const [sellerSoldProducts, setSellerSoldProducts] = useState([]);
  const [loadingSellerProducts, setLoadingSellerProducts] = useState(false);
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
    // Check if order is ready for rating (Step 4+)
    const isReadyForRating =
      item.orderStatus === "await_rating" ||
      item.orderStatus === "completed" ||
      item.status === "await_rating" ||
      item.status === "completed";

    if (!isReadyForRating) {
      // Not ready for rating - navigate to transaction page to complete previous steps
      navigate(`/transactions/${item.orderId}`);
      return;
    }

    // Check if user has already rated
    const hasExistingRating =
      item.ratings?.buyer ||
      item.ratings?.find?.((r) => r.reviewer_id === user?.id);

    setFeedbackModal({
      isOpen: true,
      item,
      isEdit: !!hasExistingRating,
      existingRating: hasExistingRating,
    });
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      // Get the item from feedbackModal state
      const item = feedbackModal.item;
      const { rating, comment } = feedbackData;
      const isEdit = feedbackModal.isEdit;

      console.log("[handleSubmitFeedback] Item:", item);
      console.log("[handleSubmitFeedback] FeedbackData:", feedbackData);
      console.log("[handleSubmitFeedback] User:", user);
      console.log("[handleSubmitFeedback] Is Edit:", isEdit);

      // Validate required data
      if (!user?.id || !item?.id) {
        toast.error("Missing user or item information");
        return;
      }

      // Ensure sellerId is available
      if (!item.sellerId) {
        toast.error("Missing seller information. Unable to submit feedback.");
        return;
      }

      // For edit mode, only allow comment updates (score cannot be changed)
      if (isEdit) {
        // In edit mode, we only update the comment
        // Note: Backend should handle this as an update operation
        console.log("[handleSubmitFeedback] Updating comment only (edit mode)");
      }

      // Create rating using ratingService
      const ratingData = {
        product_id: item.id, // The product ID
        reviewer_id: user.id, // The current user (buyer) giving the rating
        target_user_id: item.sellerId, // The seller being rated
        score: isEdit ? feedbackModal.existingRating?.score : parseInt(rating), // Use existing score for edits
        comment: comment || "", // Comment text (always editable)
      };

      console.log("[handleSubmitFeedback] Submitting rating data:", ratingData);

      await ratingService.createRating(ratingData);

      toast.success(
        isEdit
          ? "Comment updated successfully!"
          : "Feedback submitted successfully!"
      );
      closeFeedbackModal();
      // Optionally refresh won items data
      // fetchWonItems(); // Uncomment if you want to refresh the list
    } catch (error) {
      console.error("Error submitting feedback:", error);

      // Show detailed error information
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        console.error("Status:", error.response.status);

        // Show specific error message from API if available
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to submit feedback. Please try again.";
        toast.error(errorMessage);
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Network error. Please check your connection.");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to submit feedback. Please try again.");
      }
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

        console.log("[fetchWonItems] Raw API data:", data);

        // Format won orders for BidOfferCard
        const formatted = Array.isArray(data)
          ? data.map((order) => formatWonOrderForCard(order))
          : [];

        console.log("[fetchWonItems] Formatted items:", formatted);
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

  // Fetch seller's active products (only if user is a seller)
  useEffect(() => {
    let mounted = true;
    async function fetchSellerProducts() {
      if (user?.role !== "seller") {
        setSellerActiveProducts([]);
        return;
      }
      try {
        setLoadingSellerProducts(true);
        // Fetch products where seller_id matches current user
        const res = await productService.getProducts({
          seller_id: user.id,
          limit: 100,
        });
        if (!mounted) return;
        const allProducts = res.data || res.items || res || [];
        const now = new Date();
        // Filter only active products belonging to current user (seller_id match AND end_time > now)
        const active = allProducts.filter((p) => {
          // Ensure product belongs to current user
          const isOwnProduct = p.seller_id === user.id;
          if (!isOwnProduct) return false;
          // Check if auction is still active
          if (!p.end_time) return true; // assume active if no end_time
          return new Date(p.end_time) > now;
        });
        setSellerActiveProducts(active);

        // Filter sold products: ended AND has a winner
        const sold = allProducts
          .filter((p) => {
            const isOwnProduct = p.seller_id === user.id;
            if (!isOwnProduct) return false;
            // Check if auction has ended
            if (!p.end_time) return false;
            const isEnded = new Date(p.end_time) <= now;
            // Check if there's a winner
            const hasWinner = p.price_holder || p.winner_id || p.buyer_id;
            return isEnded && hasWinner;
          })
          .sort((a, b) => new Date(b.end_time) - new Date(a.end_time)); // newest sold first
        setSellerSoldProducts(sold);
      } catch (err) {
        console.error("Failed to load seller products:", err);
        if (!mounted) return;
        setSellerActiveProducts([]);
        setSellerSoldProducts([]);
      } finally {
        if (mounted) setLoadingSellerProducts(false);
      }
    }
    fetchSellerProducts();
    return () => {
      mounted = false;
    };
  }, [user]);

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

      // Build a map of user's bid amount per product (prefer latest or highest amount)
      const userBidAmountMap = {};
      myBids.forEach((b) => {
        const pid = b.product_id || b.productId || b.product?.id;
        if (!pid) return;
        const candidate = Number(b.amount ?? b.max_bid ?? 0);
        if (!userBidAmountMap[pid] || candidate > userBidAmountMap[pid]) {
          userBidAmountMap[pid] = candidate;
        }
      });

      // Fetch product details to get end_time and names
      let productMap = {};
      // Also fetch highest accepted bid per product to determine if user leads
      const highestMap = {};
      try {
        const productResults = await Promise.all(
          productIds.map((pid) =>
            productService
              .getProductById(pid)
              .then((p) => ({ pid, p }))
              .catch(() => ({ pid, p: null }))
          )
        );
        productResults.forEach(({ pid, p }) => {
          productMap[pid] = p;
        });

        const bidsResults = await Promise.all(
          productIds.map((pid) =>
            api
              .get("/api/bids", {
                params: { product_id: pid, status: "accepted" },
              })
              .then((res) => ({ pid, bids: res.data?.data || res.data || [] }))
              .catch(() => ({ pid, bids: [] }))
          )
        );
        bidsResults.forEach(({ pid, bids }) => {
          if (!Array.isArray(bids) || bids.length === 0) return;
          const top = bids.reduce((acc, b) => {
            const amt = Number(b.amount ?? 0);
            if (
              !acc ||
              amt > acc.amount ||
              (amt === acc.amount &&
                new Date(b.timestamp) > new Date(acc.timestamp))
            ) {
              return {
                amount: amt,
                bidder_id: b.bidder_id,
                timestamp: b.timestamp,
              };
            }
            return acc;
          }, null);
          if (top) highestMap[pid] = top;
        });
      } catch (e) {
        console.warn("Failed to load some product/bid details", e);
      }

      const now = new Date();
      const active = [];
      const lost = [];

      productIds.forEach((pid) => {
        const product = productMap[pid] || {};
        const endTime = product.end_time ? new Date(product.end_time) : null;
        const isActive = endTime ? endTime > now : true; // assume active if missing end_time
        const won = wonItems.some((w) => String(w.id) === String(pid));
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
            userBidAmount: userBidAmountMap[pid],
          },
          isActive ? "bid" : "lost"
        );

        if (isActive) {
          const currentUserId = user?.id;
          const productPriceHolderId = product?.price_holder;
          const topBidderId = highestMap[pid]?.bidder_id;
          const highestBidderId = productPriceHolderId ?? topBidderId;
          if (currentUserId != null && highestBidderId != null) {
            const isWinning = String(highestBidderId) === String(currentUserId);
            card.isWinning = isWinning;
            card.status = isWinning ? "Winning" : "Outbid";
          }
        }

        if (isActive && !won) active.push(card);
        if (!isActive && !won) lost.push(card);
      });

      setActiveBids(active);
      setLostItems(lost);
    }

    buildBidLists();
  }, [myBids, wonItems, user]);

  // Build transaction cards enriched with product details and user's bid
  useEffect(() => {
    let mounted = true;
    async function buildTxCards() {
      try {
        if (!Array.isArray(transactions) || transactions.length === 0) {
          setTxCards([]);
          return;
        }
        const productIds = Array.from(
          new Set(
            transactions
              .map((tx) => tx.product_id || tx.productId)
              .filter(Boolean)
          )
        );
        const productMap = {};
        // Fetch product details to get thumbnail and end_time
        try {
          const productResults = await Promise.all(
            productIds.map((pid) =>
              productService
                .getProductById(pid)
                .then((p) => ({ pid, p }))
                .catch(() => ({ pid, p: null }))
            )
          );
          productResults.forEach(({ pid, p }) => {
            productMap[pid] = p || {};
          });
        } catch (e) {
          console.warn(
            "Failed to load some product details for transactions",
            e
          );
        }

        // Build a map of user's bid amount per product
        const userBidAmountMap = {};
        if (Array.isArray(myBids) && myBids.length) {
          myBids.forEach((b) => {
            const pid = b.product_id || b.productId || b.product?.id;
            if (!pid) return;
            const candidate = Number(b.amount ?? b.max_bid ?? 0);
            if (!userBidAmountMap[pid] || candidate > userBidAmountMap[pid]) {
              userBidAmountMap[pid] = candidate;
            }
          });
        }

        const cards = transactions.map((tx) => {
          const pid = tx.product_id || tx.productId;
          const product = productMap[pid] || {};
          const name = tx.productName || product.name || "Transaction Item";
          const imageSrc =
            product.thumbnail ||
            product.productImage ||
            product.images?.[0]?.image_url ||
            product.images?.[0]?.src ||
            "/images/sample.jpg";
          const ended = product.end_time
            ? new Date(product.end_time).toLocaleDateString()
            : tx.created_at
            ? new Date(tx.created_at).toLocaleDateString()
            : "N/A";
          const amount =
            userBidAmountMap[pid] !== undefined
              ? userBidAmountMap[pid]
              : tx.final_price !== undefined
              ? Number(tx.final_price)
              : null;
          return {
            id: tx.id,
            productId: pid,
            name,
            imageSrc,
            amount,
            ended,
            status: tx.status,
          };
        });

        if (mounted) setTxCards(cards);
      } catch (e) {
        console.warn("Failed to build transaction cards", e);
        if (mounted) setTxCards([]);
      }
    }
    buildTxCards();
    return () => {
      mounted = false;
    };
  }, [transactions, myBids]);

  return (
    <div className="bg-whisper min-h-screen">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 py-4">
        <div className="lg:flex lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <Tabs />
            </div>

            <div className="flex flex-col gap-8">
              {/* ========== SELLER SECTION ========== */}
              {user?.role === "seller" && (
                <>
                  <section>
                    <h2 className="text-lg font-bold text-midnight-ash mb-2">
                      YOUR ACTIVE LISTINGS
                    </h2>
                    <p className="text-sm text-pebble mb-4">
                      Products you are currently selling
                    </p>
                    <div className="flex flex-col gap-2">
                      {loadingSellerProducts ? (
                        <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                          Loading your listings...
                        </div>
                      ) : sellerActiveProducts.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                          No active listings. Start selling now!
                        </div>
                      ) : (
                        sellerActiveProducts.map((product) => {
                          const thumbnail =
                            product.thumbnail ||
                            product.images?.[0]?.image_url ||
                            "/images/sample.jpg";
                          const currentPrice =
                            product.current_price || product.start_price || 0;
                          const bidCount = product.bid_count || 0;
                          return (
                            <div
                              key={product.id}
                              onClick={() =>
                                navigate(`/products/${product.id}`)
                              }
                              className="flex items-center gap-4 bg-white border border-morning-mist p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
                            >
                              <img
                                src={thumbnail}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="text-base font-semibold text-midnight-ash">
                                  {product.name}
                                </div>
                                <div className="text-sm text-pebble mt-1">
                                  {bidCount} bid{bidCount !== 1 ? "s" : ""}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-bold text-midnight-ash">
                                  {Number(currentPrice).toLocaleString("vi-VN")}{" "}
                                  VND
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                  Active
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  {/* ========== SELLER SOLD PRODUCTS SECTION ========== */}
                  <section>
                    <h2 className="text-lg font-bold text-midnight-ash mb-2">
                      SOLD PRODUCTS
                    </h2>
                    <p className="text-sm text-pebble mb-4">
                      Products that have ended and have a buyer
                    </p>
                    <div className="flex flex-col gap-2">
                      {loadingSellerProducts ? (
                        <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                          Loading sold products...
                        </div>
                      ) : sellerSoldProducts.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                          No sold products yet
                        </div>
                      ) : (
                        sellerSoldProducts.map((product) => {
                          const thumbnail =
                            product.thumbnail ||
                            product.images?.[0]?.image_url ||
                            "/images/sample.jpg";
                          const finalPrice =
                            product.final_price ||
                            product.current_price ||
                            product.start_price ||
                            0;
                          const winnerName =
                            product.price_holder_name ||
                            product.winner_name ||
                            product.buyer_name ||
                            "Buyer";
                          const endDate = product.end_time
                            ? new Date(product.end_time).toLocaleDateString()
                            : "N/A";
                          return (
                            <div
                              key={product.id}
                              onClick={() =>
                                navigate(`/products/${product.id}`)
                              }
                              className="flex items-center gap-4 bg-white border border-morning-mist p-4 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
                            >
                              <img
                                src={thumbnail}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="text-base font-semibold text-midnight-ash">
                                  {product.name}
                                </div>
                                <div className="text-sm text-pebble mt-1">
                                  Sold to: {winnerName} • Ended: {endDate}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-bold text-midnight-ash">
                                  {Number(finalPrice).toLocaleString("vi-VN")}{" "}
                                  VND
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                  Sold
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* ========== BUYER BIDDING ACTIVITY SECTION ========== */}
              <section>
                <h2 className="text-lg font-bold text-midnight-ash mb-2">
                  YOUR BIDDING ACTIVITY
                </h2>
                <p className="text-sm text-pebble mb-4">
                  Auctions you are currently participating in
                </p>
                <div className="flex flex-col gap-2">
                  {loadingBids ? (
                    <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                      Loading your bids...
                    </div>
                  ) : activeBids.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
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

              {/* ========== TRANSACTION HISTORY SECTION ========== */}
              {/*
                NOTE: If "Won Money" shows "N/A" in this section, the fix must be applied
                within the backend API or transactionService that provides the price data.
                The `current_price` or `final_price` field needs to be populated correctly
                in the transaction/order response from the server.
              */}
              <section>
                <h2 className="text-lg font-bold text-midnight-ash mb-2">
                  TRANSACTION HISTORY
                </h2>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-pebble">
                    Your completed and pending transactions
                  </p>
                  {transactions.length > 0 && (
                    <button
                      onClick={() => navigate("/transactions")}
                      className="text-sm font-semibold text-deep-charcoal bg-transparent px-4 py-1 cursor-pointer hover:bg-gray-50 underline"
                    >
                      View All
                    </button>
                  )}
                </div>
                {loadingTx ? (
                  <div className="text-gray-500">Loading transactions...</div>
                ) : txError ? (
                  <div className="text-red-500">{txError}</div>
                ) : transactions.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                    No transactions found
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {txCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => navigate(`/transactions/${card.id}`)}
                        className="flex items-center gap-4 bg-white border border-morning-mist p-4 rounded-lg cursor-pointer"
                      >
                        <img
                          src={card.imageSrc}
                          alt={card.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="text-base font-semibold text-midnight-ash">
                            {card.name}
                          </div>
                          <div className="flex gap-6 mt-2 text-sm text-midnight-ash">
                            <span>
                              Your bid:{" "}
                              <span className="text-midnight-ash font-bold ml-1">
                                {card.amount != null
                                  ? `${Number(card.amount).toLocaleString(
                                      "vi-VN"
                                    )} VND`
                                  : "N/A"}
                              </span>
                            </span>
                            <span>
                              Ended:
                              <span className="text-midnight-ash font-bold ml-1">
                                {card.ended}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm ${
                              card.status === "completed"
                                ? "text-green-600"
                                : card.status === "cancelled"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {card.status || "Unknown"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ========== WON ITEMS SECTION ========== */}
              <section>
                <h2 className="text-lg font-bold text-midnight-ash mb-2">
                  WON AUCTIONS
                </h2>
                <p className="text-sm text-pebble mb-4">
                  Auctions where your bid was successful
                </p>
                <div className="flex flex-col gap-2">
                  {loadingWon ? (
                    <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                      Loading won items...
                    </div>
                  ) : wonItems.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
                      You haven't won any items yet
                    </div>
                  ) : (
                    wonItems.map((item) => {
                      // Determine feedback button label and action
                      const isReadyForRating =
                        item.orderStatus === "await_rating" ||
                        item.orderStatus === "completed" ||
                        item.status === "await_rating" ||
                        item.status === "completed";
                      const hasExistingRating =
                        item.ratings?.buyer ||
                        item.ratings?.find?.((r) => r.reviewer_id === user?.id);

                      let feedbackLabel = "Complete Order";
                      if (isReadyForRating) {
                        feedbackLabel = hasExistingRating
                          ? "Edit Feedback"
                          : "Leave Feedback";
                      }

                      return (
                        <BidOfferCard
                          key={item.id}
                          {...item}
                          onFeedback={() => handleFeedback(item)}
                          feedbackLabel={feedbackLabel}
                          feedbackDisabled={!isReadyForRating}
                        />
                      );
                    })
                  )}
                </div>
              </section>

              {/* ========== DIDN'T WIN SECTION ========== */}
              <section>
                <h2 className="text-lg font-bold text-midnight-ash mb-2">
                  OUTBID AUCTIONS
                </h2>
                <p className="text-sm text-pebble mb-4">
                  Auctions that ended without your winning bid
                </p>
                <div className="flex flex-col gap-2">
                  {lostItems.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-morning-mist bg-white p-6 text-center text-pebble">
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
