import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { listOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import * as TransactionService from "../services/transactionService";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

const STATUS_CONFIG = {
  pending_payment: {
    label: "Pending Payment",
    className: "bg-yellow-100 text-yellow-800",
  },
  pending_verification: {
    label: "Pending Verification",
    className: "bg-yellow-100 text-yellow-800",
  },
  delivering: {
    label: "Shipping",
    className: "bg-blue-100 text-blue-800",
  },
  await_rating: {
    label: "Awaiting Rating",
    className: "bg-purple-100 text-purple-800",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-10 text-center text-gray-700">
          <h1 className="text-xl font-semibold">Loading Transactions...</h1>
          <p className="mt-2">Fetching your order history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-8 text-center bg-white rounded-lg shadow-md mt-10">
          <h1 className="text-3xl font-bold mb-4 text-red-600">
            Access Denied
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/auth/signin")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Transaction History
        </h1>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Role Filter Tabs */}
            <div className="flex gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRoleFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    roleFilter === tab.key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm text-gray-600">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <p className="text-sm text-gray-500 mt-3">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </p>
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            <p className="text-lg font-semibold">No Transactions Found</p>
            <p className="text-md mt-2">
              {transactions.length === 0
                ? "You haven't participated in any auctions yet."
                : "No transactions match your current filters."}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => navigate("/products")}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
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
                tx.status === "await_rating" || tx.status === "completed";

              return (
                <div
                  key={tx.id}
                  className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150"
                >
                  <div
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Left: Product Image and Details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {tx.productImage ? (
                            <img
                              src={tx.productImage}
                              alt={tx.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-gray-800 truncate">
                            {tx.productName || `Order #${tx.id?.slice(0, 8)}`}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(tx.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {isBuyer && (
                              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                                Buyer
                              </span>
                            )}
                            {isSeller && (
                              <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                                Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price and Status */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-green-700">
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
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      {isBuyer && tx.sellerName && (
                        <span>Seller: {tx.sellerName}</span>
                      )}
                      {isSeller && tx.buyerName && (
                        <span>Buyer: {tx.buyerName}</span>
                      )}
                    </div>
                  </div>

                  {/* Rating Section */}
                  {canRate && (
                    <div
                      className="mt-4 pt-4 border-t border-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {userRating ? (
                            <>
                              <span className="text-sm text-gray-600">
                                Your rating:
                              </span>
                              <div className="flex items-center gap-1">
                                {userRating.score === 1 ? (
                                  <HandThumbUpIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                  <HandThumbDownIcon className="h-5 w-5 text-red-600" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    userRating.score === 1
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {userRating.score === 1 ? "+1" : "-1"}
                                </span>
                              </div>
                              {userRating.comment && (
                                <span className="text-xs text-gray-500 ml-2 truncate max-w-xs">
                                  "{userRating.comment}"
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Not rated yet
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openRatingModal(tx, isBuyer)}
                          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
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
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {selectedTransaction.ratings?.[
                selectedTransaction.buyer_id === user?.id ? "buyer" : "seller"
              ]
                ? "Update Your Rating"
                : "Rate Transaction"}
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Rate your experience with{" "}
              {selectedTransaction.buyer_id === user?.id
                ? selectedTransaction.sellerName
                : selectedTransaction.buyerName}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedRating(1)}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  selectedRating === 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbUpIcon
                    className={`h-8 w-8 ${
                      selectedRating === 1 ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedRating === 1 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    Positive (+1)
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedRating(-1)}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  selectedRating === -1
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbDownIcon
                    className={`h-8 w-8 ${
                      selectedRating === -1 ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedRating === -1 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    Negative (-1)
                  </span>
                </div>
              </button>
            </div>

            {/* Comment Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={!selectedRating}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRating
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
