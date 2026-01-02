import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import api from "../services/api";
import * as TransactionService from "../services/transactionService";
import { listOrders } from "../services/orderService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

const TABS = [
  { id: "info", label: "Personal Info" },
  { id: "ratings", label: "My Ratings" },
  { id: "watchlist", label: "Watchlist" },
  { id: "bids", label: "My Bids" },
  { id: "won", label: "Won Items" },
  { id: "products", label: "My Products", sellerOnly: true },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Personal Info State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Ratings State
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [givenRatings, setGivenRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    positive: 0,
    negative: 0,
    total: 0,
  });
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingToUpdate, setSelectedRatingToUpdate] = useState(null);
  const [newRatingScore, setNewRatingScore] = useState(null);
  const [newRatingComment, setNewRatingComment] = useState("");

  // Watchlist, Bids, Won Items State
  const [watchlist, setWatchlist] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [wonItems, setWonItems] = useState([]);
  const [myProducts, setMyProducts] = useState([]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setBirthdate(user.birthdate ? user.birthdate.split("T")[0] : "");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "ratings") {
      fetchRatings();
    } else if (activeTab === "watchlist") {
      fetchWatchlist();
    } else if (activeTab === "bids") {
      fetchMyBids();
    } else if (activeTab === "won") {
      fetchWonItems();
    } else if (activeTab === "products") {
      fetchMyProducts();
    }
  }, [activeTab, user]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchRatings() {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [receivedRes, givenRes, statsRes] = await Promise.all([
        api.get(`/api/ratings/${user.id}`),
        api.get(`/api/ratings/${user.id}/given`),
        api.get(`/api/ratings/${user.id}/score`),
      ]);
      setReceivedRatings(receivedRes.data.data || []);
      setGivenRatings(givenRes.data.data || []);
      setRatingStats(
        statsRes.data.data || { positive: 0, negative: 0, total: 0 }
      );
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
      showToast("Failed to load ratings");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWatchlist() {
    try {
      setLoading(true);
      const res = await api.get("/api/watchlist");
      setWatchlist(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyBids() {
    try {
      setLoading(true);
      const res = await api.get("/api/bids/user");
      setMyBids(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bids:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWonItems() {
    try {
      setLoading(true);
      const res = await listOrders();
      const orders = Array.isArray(res) ? res : [];
      const won = orders.filter(
        (o) => o.buyer_id === user?.id && o.status !== "cancelled"
      );
      setWonItems(won);
    } catch (err) {
      console.error("Failed to fetch won items:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyProducts() {
    try {
      setLoading(true);
      const res = await api.get("/api/products/seller");
      setMyProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePersonalInfo(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put(`/api/users/${user.id}`, {
        fullName,
        birthdate,
        email: user?.googleId || user?.facebookId ? undefined : email,
      });
      if (res.data.success) {
        updateUser(res.data.data);
        showToast("Personal information updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update info:", err);
      showToast(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }
    if (!oldPassword || !newPassword) {
      showToast("Please fill all password fields");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/auth/change-password", {
        currentPassword: oldPassword,
        newPassword,
      });
      showToast("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password:", err);
      showToast(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  function openUpdateRatingModal(rating) {
    setSelectedRatingToUpdate(rating);
    setNewRatingScore(rating.score);
    setNewRatingComment(rating.comment || "");
    setRatingModalOpen(true);
  }

  async function handleUpdateRating() {
    if (!selectedRatingToUpdate || !newRatingScore) {
      showToast("Please select a rating");
      return;
    }

    try {
      await TransactionService.rateTransaction(
        selectedRatingToUpdate.product_id,
        newRatingScore,
        newRatingComment
      );
      showToast("Rating updated successfully!");
      setRatingModalOpen(false);
      setSelectedRatingToUpdate(null);
      fetchRatings();
    } catch (err) {
      console.error("Failed to update rating:", err);
      showToast(err.response?.data?.message || "Failed to update rating");
    }
  }

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.SOFT_CLOUD }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Profile</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TABS.filter(
              (tab) => !tab.sellerOnly || user?.role === "seller"
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "info" && (
            <div className="space-y-8">
              {/* Personal Info Form */}
              <form onSubmit={handleUpdatePersonalInfo}>
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={user?.googleId || user?.facebookId}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        user?.googleId || user?.facebookId
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    />
                    {(user?.googleId || user?.facebookId) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed for social login accounts
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Update Information
                    </button>
                  </div>
                </div>
              </form>

              {/* Change Password Form */}
              {!user?.googleId && !user?.facebookId && (
                <form onSubmit={handleChangePassword}>
                  <h2 className="text-xl font-semibold mb-4 pt-6 border-t">
                    Change Password
                  </h2>
                  <div className="grid grid-cols-1 gap-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-8">
              {/* Rating Stats */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Your Rating Score
                </h2>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-600">
                      {user?.rating_points || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-2xl font-semibold text-green-600">
                          {ratingStats.positive}
                        </p>
                        <p className="text-xs text-gray-500">Positive</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HandThumbDownIcon className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="text-2xl font-semibold text-red-600">
                          {ratingStats.negative}
                        </p>
                        <p className="text-xs text-gray-500">Negative</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Received Ratings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ratings Received</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : receivedRatings.length === 0 ? (
                  <p className="text-gray-500">No ratings received yet</p>
                ) : (
                  <div className="space-y-3">
                    {receivedRatings.map((rating) => (
                      <div
                        key={rating.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {rating.score === 1 ? (
                              <HandThumbUpIcon className="h-6 w-6 text-green-600" />
                            ) : (
                              <HandThumbDownIcon className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <p
                                className={`font-semibold ${
                                  rating.score === 1
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {rating.score === 1 ? "+1" : "-1"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(rating.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="mt-2 text-sm text-gray-700 italic">
                            "{rating.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Given Ratings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Ratings Given by You
                </h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : givenRatings.length === 0 ? (
                  <p className="text-gray-500">You haven't rated anyone yet</p>
                ) : (
                  <div className="space-y-3">
                    {givenRatings.map((rating) => (
                      <div
                        key={rating.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {rating.score === 1 ? (
                              <HandThumbUpIcon className="h-6 w-6 text-green-600" />
                            ) : (
                              <HandThumbDownIcon className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {rating.target_user_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {rating.product_name} •{" "}
                                {formatDate(rating.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openUpdateRatingModal(rating)}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            Update
                          </button>
                        </div>
                        {rating.comment && (
                          <p className="mt-2 text-sm text-gray-700 italic">
                            "{rating.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "watchlist" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Watchlist</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : watchlist.length === 0 ? (
                <p className="text-gray-500">Your watchlist is empty</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/products/${item.product_id}`)}
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium">
                        {item.product_name || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Added {formatDate(item.added_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bids" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Bids</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : myBids.length === 0 ? (
                <p className="text-gray-500">You haven't placed any bids yet</p>
              ) : (
                <div className="space-y-3">
                  {myBids.map((bid) => (
                    <div key={bid.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {bid.product_name || "Product"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(bid.created_at)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          {formatPrice(bid.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "won" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Won Items</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : wonItems.length === 0 ? (
                <p className="text-gray-500">
                  You haven't won any auctions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {wonItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/transactions/${item.id}`)}
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {item.productName || "Product"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: {item.status} •{" "}
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          {formatPrice(item.final_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && user?.role === "seller" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Products</h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : myProducts.length === 0 ? (
                <p className="text-gray-500">
                  You haven't listed any products yet
                </p>
              ) : (
                <div className="space-y-3">
                  {myProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            Status: {product.status} •{" "}
                            {formatDate(product.created_at)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          {formatPrice(product.current_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Update Rating Modal */}
      {ratingModalOpen && selectedRatingToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Update Rating</h2>
            <p className="text-sm text-gray-600 mb-6">
              Update your rating for {selectedRatingToUpdate.target_user_name}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setNewRatingScore(1)}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  newRatingScore === 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbUpIcon
                    className={`h-8 w-8 ${
                      newRatingScore === 1 ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      newRatingScore === 1 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    Positive (+1)
                  </span>
                </div>
              </button>
              <button
                onClick={() => setNewRatingScore(-1)}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  newRatingScore === -1
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HandThumbDownIcon
                    className={`h-8 w-8 ${
                      newRatingScore === -1 ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      newRatingScore === -1 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    Negative (-1)
                  </span>
                </div>
              </button>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={newRatingComment}
                onChange={(e) => setNewRatingComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRatingModalOpen(false);
                  setSelectedRatingToUpdate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRating}
                disabled={!newRatingScore}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  newRatingScore
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Update Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
