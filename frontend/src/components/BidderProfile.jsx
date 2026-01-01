import { useState } from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BidderProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { signout } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoToLogin = async () => {
    await signout();
    navigate("/auth/signin");
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
          <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>
        </div>

        <form className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300">
                    <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6">
                      workcation.com/
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="janesmith"
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-midnight-ashsh placeholder:text-pebble"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  About
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400  sm:text-sm/6"
                    defaultValue={""}
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  Write a few sentences about yourself.
                </p>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="photo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <UserCircleIcon
                    aria-hidden="true"
                    className="size-12 text-gray-300"
                  />
                  <button
                    type="button"
                    style={{
                      borderRadius: BORDER_RADIUS.FULL,
                      backgroundColor: COLORS.WHITE,
                      padding: `${SPACING.S} ${SPACING.L}`,
                      fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      border: `1.5px solid ${COLORS.MORNING_MIST}`,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    className="hover:opacity-90"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Cover photo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <PhotoIcon
                      aria-hidden="true"
                      className="mx-auto size-12 text-gray-300"
                    />
                    <div className="mt-4 flex text-sm/6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-midnight-ashsh  hover:!underline hover:text-pebble "
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs/5 text-gray-600">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
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

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Use a permanent address where you can receive mail.
          </p>
        </div>

        <form className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="country"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="street-address"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Street address
                </label>
                <div className="mt-2">
                  <input
                    id="street-address"
                    name="street-address"
                    type="text"
                    autoComplete="street-address"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="city"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  City
                </label>
                <div className="mt-2">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="region"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    id="region"
                    name="region"
                    type="text"
                    autoComplete="address-level1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="postal-code"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <input
                    id="postal-code"
                    name="postal-code"
                    type="text"
                    autoComplete="postal-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
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

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            We'll always let you know about important changes, but you pick what
            else you want to hear about.
          </p>
        </div>

        <form className="bg-white ring-1 shadow-xs ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
      </div>
    </div>
  );
}
