"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import ratingService from "../services/ratingService";
import { bidService } from "../services/bidService";

export default function BiddingQuickView({
  open = false,
  onClose = () => { },
  product = null,
  onBidSuccess = () => { },
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maxBid, setMaxBid] = useState("");
  const [parsedMaxBid, setParsedMaxBid] = useState(0);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Rating eligibility check
  const [eligibility, setEligibility] = useState({
    allowed: true,
    message: "",
    rating_percentage: null,
  });

  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  // Calculate pricing from real product data
  const currentPrice = product
    ? Number(product.current_price || product.start_price || 0)
    : 0;

  const stepPrice = Number(product?.step_price || 0);

  // Min bid = current + step (for first bid, it's start_price)
  const hasBids = product?.bid_count > 0 || product?.current_price > product?.start_price;
  const minBid = hasBids ? currentPrice + stepPrice : currentPrice;

  // Buy now price (optional)
  const buyNowPrice = Number(product?.buy_now_price || 0);

  // Derive display image
  const displayImage =
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.images?.[0]?.image_url ||
    "/images/sample.jpg";

  useEffect(() => {
    // Reset state when product changes or opens
    if (open) {
      setMaxBid("");
      setError("");
      setIsValid(false);
      setSuccessMessage("");

      // Check rating eligibility
      const checkEligibility = async () => {
        if (!user || !user.id) {
          setEligibility({
            allowed: false,
            message: "Please sign in to place a bid.",
            rating_percentage: null,
          });
          return;
        }

        try {
          const stats = await ratingService.getUserRatingEligibility(user.id);
          const ratingPercentage = stats.rating_percentage;
          const canBid = stats.can_bid;

          // Check if product allows unrated bidders
          const allowsUnrated = product?.allow_unrated_bidder || false;

          if (!canBid && !allowsUnrated) {
            setEligibility({
              allowed: false,
              message: `Your positive rating (${ratingPercentage?.toFixed(0) || 0
                }%) is below 80%. You cannot bid on this product.`,
              rating_percentage: ratingPercentage,
            });
          } else {
            setEligibility({
              allowed: true,
              message: "",
              rating_percentage: ratingPercentage,
            });
          }
        } catch (err) {
          console.error("Rating check failed:", err);
          // Default to allowed if check fails (for unrated users or errors)
          setEligibility({
            allowed: true,
            message: "",
            rating_percentage: null,
          });
        }
      };

      checkEligibility();
    }
  }, [open, product, user]);

  useEffect(() => {
    // Parse and validate max bid
    if (!maxBid) {
      setParsedMaxBid(0);
      setIsValid(false);
      setError("");
      return;
    }

    const num = Number(maxBid);
    if (Number.isNaN(num)) {
      setParsedMaxBid(0);
      setIsValid(false);
      setError("Enter a valid number");
      return;
    }

    setParsedMaxBid(num);

    if (num < minBid) {
      setIsValid(false);
      setError(`Minimum bid is ${currency.format(minBid)}`);
      return;
    }

    setIsValid(true);
    setError("");
  }, [maxBid, minBid]);

  const handlePlaceBid = async (event) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("[BiddingQuickview] Placing auto-bid:", {
        product_id: product.id,
        max_bid: parsedMaxBid,
      });

      const result = await bidService.placeBid({
        product_id: product.id,
        max_bid: parsedMaxBid,
      });

      console.log("[BiddingQuickview] Bid result:", result);

      // Show success message
      const winningAmount = result.data?.competition?.winningAmount || parsedMaxBid;
      setSuccessMessage(
        `Auto-bid set! Current winning bid: ${currency.format(winningAmount)}`
      );

      // Notify parent component
      onBidSuccess(result.data);

      // Close modal after a short delay
      setTimeout(() => {
        onClose(true);
      }, 2000);
    } catch (err) {
      console.error("[BiddingQuickview] Bid error:", err);
      setError(err.response?.data?.message || err.message || "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSuggestion = () => {
    setMaxBid(String(minBid));
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 hidden bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:block"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
          <DialogPanel
            transition
            className="flex w-full transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95 lg:max-w-4xl"
          >
            <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8 rounded-lg">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>

              <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                <div className="sm:col-span-4 lg:col-span-5">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                      alt={product.name}
                      src={displayImage}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>
                <div className="sm:col-span-8 lg:col-span-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-lg text-gray-700">
                        Current: {currency.format(currentPrice)}
                      </p>
                    </div>
                    {product.end_time && (
                      <div className="text-sm text-gray-500">
                        Ends:{" "}
                        {new Date(product.end_time).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>

                  {/* Auto-bid explanation */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-800">
                      Auto-Bid System
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Set your maximum bid. The system will automatically bid just enough to keep you winning, up to your maximum.
                    </p>
                  </div>

                  {/* Suggested bid */}
                  <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                    <div>
                      Minimum bid:{" "}
                      <span className="font-medium text-gray-900">
                        {currency.format(minBid)}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        disabled={!eligibility.allowed}
                        style={{
                          padding: `4px ${SPACING.M}`,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1.5px solid ${COLORS.MORNING_MIST}`,
                          cursor: eligibility.allowed ? "pointer" : "not-allowed",
                          fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                          marginLeft: SPACING.M,
                          opacity: eligibility.allowed ? 1 : 0.5,
                        }}
                        className="hover:opacity-90 transition-all"
                      >
                        Use minimum
                      </button>
                    </div>
                  </div>

                  {/* Max bid input form */}
                  <form onSubmit={handlePlaceBid} className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Your maximum bid (VND)
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      You will only pay enough to beat other bidders
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative w-full">
                        <input
                          type="number"
                          value={maxBid}
                          onChange={(e) => setMaxBid(e.target.value)}
                          placeholder={String(minBid)}
                          className={`w-full rounded-md border px-3 py-2 text-lg focus:ring-2 focus:ring-indigo-500 ${!eligibility.allowed || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                            }`}
                          disabled={!eligibility.allowed || isSubmitting}
                        />
                      </div>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                    {successMessage && (
                      <p className="mt-2 text-sm text-green-600">{successMessage}</p>
                    )}
                    {isValid && !successMessage && (
                      <p className="mt-2 text-sm text-green-600">
                        Maximum bid: {currency.format(parsedMaxBid)}
                      </p>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={!isValid || !eligibility.allowed || isSubmitting}
                        style={{
                          backgroundColor:
                            isValid && eligibility.allowed && !isSubmitting
                              ? COLORS.MIDNIGHT_ASH
                              : "#d1d5db",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "9999px",
                          width: "100%",
                          fontWeight: "600",
                          cursor:
                            isValid && eligibility.allowed && !isSubmitting
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        {isSubmitting ? "Setting bid..." : "Set Maximum Bid"}
                      </button>
                    </div>

                    {!eligibility.allowed && (
                      <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="font-semibold mb-1">
                          Cannot Place Bid
                        </p>
                        <p>
                          {eligibility.message ||
                            "You are not eligible to bid on this product."}
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
