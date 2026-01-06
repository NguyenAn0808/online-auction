import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { listOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import * as TransactionService from "../services/transactionService";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

// Design System Colors
const COLORS = {
  WHISPER: "#F8F6F0",
  WHITE: "#FFFFFF",
  SOFT_CLOUD: "#F0EEE6",
  MORNING_MIST: "#B3BFB9",
  MIDNIGHT_ASH: "#1F1F1F",
  PEBBLE: "#938A83",
};

const STATUS_CONFIG = {
  pending_payment: {
    label: "Pending Payment",
    className: "bg-[#F0EEE6] text-[#938A83]",
  },
  pending_verification: {
    label: "Pending Verification",
    className: "bg-[#F0EEE6] text-[#938A83]",
  },
  PendingBidderPayment: {
    label: "Pending Payment",
    className: "bg-[#F0EEE6] text-[#938A83]",
  },
  PendingSellerConfirmation: {
    label: "Pending Confirmation",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  PendingDelivery: {
    label: "Shipping",
    className: "bg-[#DBEAFE] text-[#1E40AF]",
  },
  delivering: {
    label: "Shipping",
    className: "bg-[#DBEAFE] text-[#1E40AF]",
  },
  PendingRating: {
    label: "Awaiting Rating",
    className: "bg-[#EDE9FE] text-[#5B21B6]",
  },
  await_rating: {
    label: "Awaiting Rating",
    className: "bg-[#EDE9FE] text-[#5B21B6]",
  },
  Completed: {
    label: "Completed",
    className: "bg-[#D1FAE5] text-[#065F46]",
  },
  completed: {
    label: "Completed",
    className: "bg-[#D1FAE5] text-[#065F46]",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-[#FEE2E2] text-[#991B1B]",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[#FEE2E2] text-[#991B1B]",
  },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "buyer", label: "As Buyer" },
  { key: "seller", label: "As Seller" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Statuses" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "pending_verification", label: "Pending Verification" },
  { key: "delivering", label: "Shipping" },
  { key: "await_rating", label: "Awaiting Rating" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingComment, setRatingComment] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await listOrders();
        setTransactions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch transaction history:", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError("You must be logged in to view your transaction history.");
        } else {
          setError("A general error occurred while loading history.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function openRatingModal(tx, isBuyer) {
    setSelectedTransaction(tx);
    const userRole = isBuyer ? "buyer" : "seller";
    const existingRating = tx.ratings?.[userRole];

    if (existingRating) {
      setSelectedRating(existingRating.score);
      setRatingComment(existingRating.comment || "");
    } else {
      setSelectedRating(null);
      setRatingComment("");
    }

    setRatingModalOpen(true);
  }

  async function handleRatingSubmit() {
    if (!selectedTransaction || !selectedRating) {
      showToast("Please select a rating");
      return;
    }

    try {
      await TransactionService.rateTransaction(
        selectedTransaction.id,
        selectedRating,
        ratingComment
      );

      const isBuyer = selectedTransaction.buyer_id === user?.id;
      const userRole = isBuyer ? "buyer" : "seller";
      const hasExistingRating = selectedTransaction.ratings?.[userRole];

      showToast(
        hasExistingRating
          ? "Rating updated successfully!"
          : "Rating submitted successfully!"
      );

      // Refresh transactions to show updated rating
      const data = await listOrders();
      setTransactions(Array.isArray(data) ? data : []);

      // Close modal
      setRatingModalOpen(false);
      setSelectedTransaction(null);
      setSelectedRating(null);
      setRatingComment("");
    } catch (err) {
      console.error("Rating error:", err);
      showToast(err.response?.data?.message || "Failed to submit rating");
    }
  }

  const formatStatus = (status) => {
    const config = STATUS_CONFIG[status];
    return config ? config.label : status?.replace(/_/g, " ") || "Unknown";
  };

  const getStatusClassName = (status) => {
    const config = STATUS_CONFIG[status];
    return config ? config.className : "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Filter transactions based on role and status
  const filteredTransactions = transactions.filter((tx) => {
    // Role filter
    if (roleFilter === "buyer" && tx.buyer_id !== user?.id) return false;
    if (roleFilter === "seller" && tx.seller_id !== user?.id) return false;

    // Status filter
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <Header />
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-[#1F1F1F]">Loading Transactions...</h1>
            <p className="mt-2 text-[#938A83]">Fetching your order history.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <Header />
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="bg-white p-8 text-center rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#B3BFB9]/20">
            <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#991B1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-[#1F1F1F]">
              Access Denied
            </h1>
            <p className="text-[#938A83] mb-6">{error}</p>
            <button
              onClick={() => navigate("/auth/signin")}
              className="bg-[#1F1F1F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#393939] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <Header />
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1F1F1F]">
            Transaction History
          </h1>
          <p className="text-[#938A83] mt-2">View and manage all your auction transactions</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#B3BFB9]/20 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Role Filter Tabs - Underline Style */}
            <div className="flex gap-1 border-b border-[#B3BFB9]/20 pb-0">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRoleFilter(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-all relative ${
                    roleFilter === tab.key
                      ? "text-[#1F1F1F] font-semibold"
                      : "text-[#938A83] hover:text-[#1F1F1F]"
                  }`}
                >
                  {tab.label}
                  {roleFilter === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F1F1F]" />
                  )}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="status-filter" className="text-sm text-[#938A83]">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#B3BFB9] rounded-full px-4 py-2 text-sm text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/20 cursor-pointer"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-[#938A83] mt-4 pt-4 border-t border-[#B3BFB9]/20">
            Showing <span className="font-semibold text-[#1F1F1F]">{filteredTransactions.length}</span> of {transactions.length} transactions
          </p>
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-12 border border-dashed border-[#B3BFB9] rounded-lg text-center">
            <div className="w-16 h-16 bg-[#F0EEE6] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-lg font-semibold text-[#1F1F1F]">No Transactions Found</p>
            <p className="text-[#938A83] mt-2">
              {transactions.length === 0
                ? "You haven't participated in any auctions yet."
                : "No transactions match your current filters."}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => navigate("/products")}
                className="mt-6 px-6 py-3 bg-[#1F1F1F] text-white rounded-full font-medium hover:bg-[#393939] transition-colors"
              >
                Browse Auctions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const isBuyer = tx.buyer_id === user?.id;
              const isSeller = tx.seller_id === user?.id;
              const userRole = isBuyer ? "buyer" : "seller";
              const userRating = tx.ratings?.[userRole];
              const canRate =
                tx.status === "await_rating" || tx.status === "completed" ||
                tx.status === "PendingRating" || tx.status === "Completed";

              return (
                <div
                  key={tx.id}
                  className="bg-white p-5 border border-[#B3BFB9]/20 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-[#B3BFB9]/40 transition-all duration-200"
                >
                  <div
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Left: Product Image and Details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F0EEE6] flex-shrink-0">
                          {tx.productImage ? (
                            <img
                              src={tx.productImage}
                              alt={tx.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#938A83] text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-[#1F1F1F] truncate">
                            {tx.productName || `Order #${tx.id?.slice(0, 8)}`}
                          </h2>
                          <p className="text-sm text-[#938A83] mt-1">
                            {new Date(tx.created_at).toLocaleDateString("vi-VN")}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {isBuyer && (
                              <span className="text-xs px-2.5 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-full font-medium">
                                Buyer
                              </span>
                            )}
                            {isSeller && (
                              <span className="text-xs px-2.5 py-1 bg-[#D1FAE5] text-[#065F46] rounded-full font-medium">
                                Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price and Status */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-semibold text-[#1F1F1F]">
                          {formatPrice(tx.final_price)}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusClassName(
                            tx.status
                          )}`}
                        >
                          {formatStatus(tx.status)}
                        </span>
                      </div>
                    </div>

                    {/* Counterparty Info */}
                    <div className="mt-4 pt-4 border-t border-[#B3BFB9]/20 text-sm text-[#938A83]">
                      {isBuyer && tx.sellerName && (
                        <span>Seller: <span className="text-[#1F1F1F] font-medium">{tx.sellerName}</span></span>
                      )}
                      {isSeller && tx.buyerName && (
                        <span>Buyer: <span className="text-[#1F1F1F] font-medium">{tx.buyerName}</span></span>
                      )}
                    </div>
                  </div>

                  {/* Rating Section */}
                  {canRate && (
                    <div
                      className="mt-4 pt-4 border-t border-[#B3BFB9]/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {userRating ? (
                            <>
                              <span className="text-sm text-[#938A83]">
                                Your rating:
                              </span>
                              <div className="flex items-center gap-1">
                                {userRating.score === 1 ? (
                                  <HandThumbUpIcon className="h-5 w-5 text-[#059669]" />
                                ) : (
                                  <HandThumbDownIcon className="h-5 w-5 text-[#DC2626]" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    userRating.score === 1
                                      ? "text-[#059669]"
                                      : "text-[#DC2626]"
                                  }`}
                                >
                                  {userRating.score === 1 ? "+1" : "-1"}
                                </span>
                              </div>
                              {userRating.comment && (
                                <span className="text-xs text-[#938A83] ml-2 truncate max-w-xs">
                                  "{userRating.comment}"
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-[#938A83]">
                              Not rated yet
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openRatingModal(tx, isBuyer)}
                          className="px-5 py-2 text-sm font-medium bg-transparent border border-[#1F1F1F] text-[#1F1F1F] rounded-full hover:bg-[#1F1F1F] hover:text-white transition-colors"
                        >
                          {userRating ? "Update Rating" : "Rate Now"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F1F1F] text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-semibold mb-2 text-[#1F1F1F]">
              {selectedTransaction.ratings?.[
                selectedTransaction.buyer_id === user?.id ? "buyer" : "seller"
              ]
                ? "Update Your Rating"
                : "Rate Transaction"}
            </h2>

            <p className="text-sm text-[#938A83] mb-6">
              Rate your experience with{" "}
              <span className="font-medium text-[#1F1F1F]">
                {selectedTransaction.buyer_id === user?.id
                  ? selectedTransaction.sellerName
                  : selectedTransaction.buyerName}
              </span>
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedRating(1)}
                className={`flex-1 p-5 border-2 rounded-xl transition-all ${
                  selectedRating === 1
                    ? "border-[#059669] bg-[#D1FAE5]"
                    : "border-[#B3BFB9]/40 hover:border-[#059669]/50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbUpIcon
                    className={`h-10 w-10 ${
                      selectedRating === 1 ? "text-[#059669]" : "text-[#938A83]"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedRating === 1 ? "text-[#059669]" : "text-[#938A83]"
                    }`}
                  >
                    Positive (+1)
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedRating(-1)}
                className={`flex-1 p-5 border-2 rounded-xl transition-all ${
                  selectedRating === -1
                    ? "border-[#DC2626] bg-[#FEE2E2]"
                    : "border-[#B3BFB9]/40 hover:border-[#DC2626]/50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbDownIcon
                    className={`h-10 w-10 ${
                      selectedRating === -1 ? "text-[#DC2626]" : "text-[#938A83]"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedRating === -1 ? "text-[#DC2626]" : "text-[#938A83]"
                    }`}
                  >
                    Negative (-1)
                  </span>
                </div>
              </button>
            </div>

            {/* Comment Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-4 py-3 border border-[#B3BFB9] rounded-lg text-[#1F1F1F] placeholder-[#938A83] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/20 focus:border-[#1F1F1F]"
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRatingModalOpen(false);
                  setSelectedTransaction(null);
                  setSelectedRating(null);
                  setRatingComment("");
                }}
                className="flex-1 px-5 py-3 border border-[#1F1F1F] text-[#1F1F1F] rounded-full font-medium hover:bg-[#F0EEE6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={!selectedRating}
                className={`flex-1 px-5 py-3 rounded-full font-medium transition-colors ${
                  selectedRating
                    ? "bg-[#1F1F1F] text-white hover:bg-[#393939]"
                    : "bg-[#F0EEE6] text-[#938A83] cursor-not-allowed"
                }`}
              >
                {selectedTransaction.ratings?.[
                  selectedTransaction.buyer_id === user?.id ? "buyer" : "seller"
                ]
                  ? "Update Rating"
                  : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
