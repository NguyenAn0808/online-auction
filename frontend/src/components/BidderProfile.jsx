import { useState, useEffect } from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import * as TransactionService from "../services/transactionService";
import { listOrders } from "../services/orderService";

export default function BidderProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { signout } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

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
  const [localToast, setLocalToast] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Fetch ratings on component mount
  useEffect(() => {
    if (user?.id) {
      fetchRatings();
    }
  }, [user]);

  const handleGoToLogin = async () => {
    await signout();
    navigate("/auth/signin");
  };

  function showToast(message) {
    setLocalToast(message);
    setTimeout(() => setLocalToast(null), 3000);
  }

  async function fetchRatings() {
    if (!user?.id) return;
    try {
      setLoadingRatings(true);
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
      setLoadingRatings(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullName = form["full-name"].value;
    const birthdate = form["birthdate"].value;
    const email = form["email"].value;

    // Validation
    if (!fullName.trim()) {
      toast.warning("Full name is required");
      return;
    }
    if (fullName.trim().length < 2) {
      toast.warning("Full name is too short");
      return;
    }
    if (!user?.googleId && !user?.facebookId && email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        toast.warning("Please enter a valid email address");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/users/${user.id}`, {
        fullName,
        birthdate,
        email: user?.googleId || user?.facebookId ? undefined : email,
      });

      if (response.data.success) {
        // Update user context with new data
        updateUser(response.data.data);
        toast.success("Personal information updated successfully!");
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error(
        error.response?.data?.message || "Failed to update personal information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (target) => {
    const { name, value, form } = target;
    let error = "";

    if (name === "old-password") {
      if (!value) error = "Current password is required";
    }

    if (name === "new-password") {
      if (!value) error = "New password is required";
      else if (value.length < 8)
        error = "Password must be at least 8 characters";

      // re-check confirm password if user edits new password
      if (form["confirm-password"].value) {
        validateField(form["confirm-password"]);
      }
    }

    if (name === "confirm-password") {
      const newPass = form["new-password"].value;
      if (!value) error = "Please confirm your password";
      else if (!newPass) error = ""; // avoid early warning
      else if (value !== newPass) error = "Passwords do not match";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (e) => {
    validateField(e.target);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // setErrors({});
    const form = e.target;

    // Grab values directly from the form (Uncontrolled)
    const currentPassword = form["old-password"].value;
    const newPassword = form["new-password"].value;
    const confirm = form["confirm-password"].value;

    // Final Validation Check
    const err1 = validateField(form["old-password"]);
    const err2 = validateField(form["new-password"]);
    const err3 = validateField(form["confirm-password"]);

    if (err1 || err2 || err3) return;

    if (currentPassword === newPassword) {
      setErrors((prev) => ({
        ...prev,
        "new-password": "New password must be different",
      }));
      return;
    }

    setLoading(true);
    try {
      // 4. FIX: Use .patch to match your backend route
      await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setShowSuccess(true);
      form.reset(); // Clear the form visually
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to change password";

      // Map Backend Errors to specific inputs
      if (
        msg.toLowerCase().includes("current") ||
        msg.toLowerCase().includes("incorrect")
      ) {
        setErrors((prev) => ({ ...prev, "old-password": msg }));
      } else if (msg.toLowerCase().includes("new")) {
        setErrors((prev) => ({ ...prev, "new-password": msg }));
      } else {
        setErrors((prev) => ({ ...prev, general: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="divide-y divide-gray-900/10 relative">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircleIcon
                className="h-10 w-10 text-green-600"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Password Changed!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been updated successfully. Please log in again
              to continue.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Update your personal details.
          </p>
        </div>

        <form
          className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={handlePersonalInfoSubmit}
          noValidate
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="full-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Full name
                </label>
                <div className="mt-2">
                  <input
                    id="full-name"
                    name="full-name"
                    type="text"
                    autoComplete="name"
                    defaultValue={user?.fullName || ""}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="birthdate"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Birthday
                </label>
                <div className="mt-2">
                  <input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    autoComplete="bday"
                    defaultValue={
                      user?.birthdate ? user.birthdate.split("T")[0] : ""
                    }
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email contact
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={user?.email || ""}
                    disabled={user?.googleId || user?.facebookId}
                    className={`block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6 ${
                      user?.googleId || user?.facebookId
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  />
                  {(user?.googleId || user?.facebookId) && (
                    <p className="mt-2 text-xs text-gray-500">
                      Email cannot be changed for social login accounts
                      (Google/Facebook)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: BORDER_RADIUS.FULL,
                padding: `${SPACING.S} ${SPACING.L}`,
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: COLORS.MIDNIGHT_ASH,
                padding: `${SPACING.S} ${SPACING.L}`,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.WHITE,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* --- PASSWORD / SECURITY SECTION --- */}
      {user?.hasPassword !== false ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Security
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Change your password to secure your account.
            </p>
          </div>

          <form
            className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2"
            onSubmit={handlePasswordChange}
            noValidate
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Current password
                  </label>
                  <input
                    name="old-password" // Keep name match input logic
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-2 block w-full rounded-md px-3 py-2 text-gray-900 outline-1 -outline-offset-1 sm:text-sm/6 transition-all ${
                      errors["old-password"]
                        ? "bg-red-50 outline-red-300 placeholder:text-red-300 focus:outline-red-600"
                        : "bg-white outline-gray-300 placeholder:text-gray-400 focus:outline-midnight-ash"
                    }`}
                  />
                  {errors["old-password"] && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="h-4 w-4" />{" "}
                      {errors["old-password"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    New password
                  </label>
                  <input
                    name="new-password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-2 block w-full rounded-md px-3 py-2 text-gray-900 outline-1 -outline-offset-1 sm:text-sm/6 transition-all ${
                      errors["new-password"]
                        ? "bg-red-50 outline-red-300 placeholder:text-red-300 focus:outline-red-600"
                        : "bg-white outline-gray-300 placeholder:text-gray-400 focus:outline-midnight-ash"
                    }`}
                  />
                  {errors["new-password"] && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="h-4 w-4" />{" "}
                      {errors["new-password"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Confirm new password
                  </label>
                  <input
                    name="confirm-password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`mt-2 block w-full rounded-md px-3 py-2 text-gray-900 outline-1 -outline-offset-1 sm:text-sm/6 transition-all ${
                      errors["confirm-password"]
                        ? "bg-red-50 outline-red-300 placeholder:text-red-300 focus:outline-red-600"
                        : "bg-white outline-gray-300 placeholder:text-gray-400 focus:outline-midnight-ash"
                    }`}
                  />
                  {errors["confirm-password"] && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="h-4 w-4" />{" "}
                      {errors["confirm-password"]}
                    </p>
                  )}
                </div>
                {errors.general && (
                  <div className="rounded-md bg-red-50 p-3 flex items-start gap-2 border border-red-100">
                    <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                      {errors.general}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: BORDER_RADIUS.FULL,
                  backgroundColor: COLORS.MIDNIGHT_ASH,
                  padding: `${SPACING.S} ${SPACING.L}`,
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.WHITE,
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2 p-8 flex flex-col items-center text-center justify-center min-h-[300px]">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            {/* Optional: You can import `ShieldCheckIcon` from heroicons/24/outline */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Social Login Account
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            You are currently logged in via <strong>Google</strong> or{" "}
            <strong>Facebook</strong>. Since you don't use a password to log in,
            you don't need to change one here.
          </p>
        </div>
      )}

      {/* --- RATINGS SECTION --- */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            My Ratings
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            View and manage ratings you've received and given.
          </p>
        </div>

        <div className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl space-y-8">
              {/* Rating Stats */}
              <div
                style={{
                  backgroundColor: COLORS.SOFT_CLOUD,
                  borderRadius: BORDER_RADIUS.LG,
                  padding: SPACING.L,
                }}
              >
                <h3
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_HEADING,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    marginBottom: SPACING.M,
                    color: COLORS.MIDNIGHT,
                  }}
                >
                  Your Rating Score
                </h3>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p
                      style={{
                        fontSize: "2.25rem",
                        fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {user?.rating_points || 0}
                    </p>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_CAPTION,
                        color: COLORS.PEBBLE,
                      }}
                    >
                      Total Points
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon
                        className="h-6 w-6"
                        style={{ color: COLORS.MIDNIGHT_ASH }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          {ratingStats.positive}
                        </p>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_CAPTION,
                            color: COLORS.PEBBLE,
                          }}
                        >
                          Positive
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <HandThumbDownIcon
                        className="h-6 w-6"
                        style={{ color: COLORS.MIDNIGHT_ASH }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          {ratingStats.negative}
                        </p>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_CAPTION,
                            color: COLORS.PEBBLE,
                          }}
                        >
                          Negative
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Received Ratings */}
              <div>
                <h4 className="text-base font-semibold mb-3">
                  Ratings Received
                </h4>
                {loadingRatings ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : receivedRatings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No ratings received yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {receivedRatings.slice(0, 5).map((rating) => (
                      <div
                        key={rating.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          {rating.score === 1 ? (
                            <HandThumbUpIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <HandThumbDownIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${
                                rating.score === 1
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {rating.score === 1 ? "+1" : "-1"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(rating.created_at)}
                            </p>
                            {rating.comment && (
                              <p className="mt-1 text-sm text-gray-700 italic">
                                "{rating.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Given Ratings */}
              <div>
                <h4 className="text-base font-semibold mb-3">
                  Ratings Given by You
                </h4>
                {loadingRatings ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : givenRatings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    You haven't rated anyone yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {givenRatings.slice(0, 5).map((rating) => (
                      <div
                        key={rating.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {rating.score === 1 ? (
                              <HandThumbUpIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <HandThumbDownIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {rating.target_user_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {rating.product_name} •{" "}
                                {formatDate(rating.created_at)}
                              </p>
                              {rating.comment && (
                                <p className="mt-1 text-sm text-gray-700 italic line-clamp-2">
                                  "{rating.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => openUpdateRatingModal(rating)}
                            className="px-3 py-1 text-xs text-pebble hover:text-midnight-ash/90 hover:bg-midnight-ash/10 rounded-lg transition-colors flex-shrink-0"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            We'll always let you know about important changes, but you pick what
            else you want to hear about.
          </p>
        </div>

        <form className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2" noValidate>
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl space-y-10 md:col-span-2">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900">
                  By email
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          defaultChecked
                          id="comments"
                          name="comments"
                          type="checkbox"
                          aria-describedby="comments-description"
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-midnight-ash checked:bg-midnight-ash indeterminate:border-midnight-ash indeterminate:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ash disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <svg
                          fill="none"
                          viewBox="0 0 14 14"
                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-checked:opacity-100"
                          />
                          <path
                            d="M3 7H11"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-indeterminate:opacity-100"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="comments"
                        className="font-medium text-gray-900"
                      >
                        Comments
                      </label>
                      <p id="comments-description" className="text-gray-500">
                        Get notified when someones posts a comment on a posting.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id="candidates"
                          name="candidates"
                          type="checkbox"
                          aria-describedby="candidates-description"
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-midnight-ash checked:bg-midnight-ash indeterminate:border-midnight-ash indeterminate:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ash disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <svg
                          fill="none"
                          viewBox="0 0 14 14"
                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-checked:opacity-100"
                          />
                          <path
                            d="M3 7H11"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-indeterminate:opacity-100"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="candidates"
                        className="font-medium text-gray-900"
                      >
                        Candidates
                      </label>
                      <p id="candidates-description" className="text-gray-500">
                        Get notified when a candidate applies for a job.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id="offers"
                          name="offers"
                          type="checkbox"
                          aria-describedby="offers-description"
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-midnight-ash checked:bg-midnight-ash indeterminate:border-midnight-ash indeterminate:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ash disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <svg
                          fill="none"
                          viewBox="0 0 14 14"
                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-checked:opacity-100"
                          />
                          <path
                            d="M3 7H11"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-indeterminate:opacity-100"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="offers"
                        className="font-medium text-gray-900"
                      >
                        Offers
                      </label>
                      <p id="offers-description" className="text-gray-500">
                        Get notified when a candidate accepts or rejects an
                        offer.
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900">
                  Push notifications
                </legend>
                <p className="mt-1 text-sm/6 text-gray-600">
                  These are delivered via SMS to your mobile phone.
                </p>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-x-3">
                    <input
                      defaultChecked
                      id="push-everything"
                      name="push-notifications"
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-midnight-ash checked:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ash disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <label
                      htmlFor="push-everything"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Everything
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="push-email"
                      name="push-notifications"
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-midnight-ash checked:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ash disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <label
                      htmlFor="push-email"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Same as email
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="push-nothing"
                      name="push-notifications"
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-midnight-ashsh checked:bg-midnight-ashsh focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight-ashsh disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <label
                      htmlFor="push-nothing"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      No push notifications
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: BORDER_RADIUS.FULL,
                padding: `${SPACING.S} ${SPACING.L}`,
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: COLORS.MIDNIGHT_ASH,
                padding: `${SPACING.S} ${SPACING.L}`,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.WHITE,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              className="hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div> */}

      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {localToast}
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
