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
  onClose = () => {},
  product = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const [product, setProduct] = useState(null); // Now using prop
  const [manualBid, setManualBid] = useState("");
  const [parsedBid, setParsedBid] = useState(0);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Min bid = current + step
  // EXCEPT if no bids yet? usually start_price is the min for first bid.
  // If current_price == start_price and bid_count == 0, then min is start_price?
  // Let's assume min bid is always > current price unless no bids.
  // Simplified logic: Next valid bid must be at least current + step
  const minBid = currentPrice + stepPrice;

  // No strict max bid usually, or maybe buyNowPrice?
  // Let's assume max is very high or buyNowPrice if set.
  const buyNowPrice = Number(product?.buy_now_price || 0);

  // Derive display image
  const displayImage =
    product?.thumbnail ||
    product?.images?.[0] || // handle if images is array of strings
    product?.images?.[0]?.image_url || // handle if images is array of objects
    "/images/sample.jpg";

  useEffect(() => {
    // Reset state when product changes or opens
    if (open) {
      setManualBid("");
      setError("");
      setIsValid(false);

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
              message: `Your positive rating (${
                ratingPercentage?.toFixed(0) || 0
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
    // parse manualBid and validate
    if (!manualBid) {
      setParsedBid(0);
      setIsValid(false);
      setError("");
      return;
    }

    const num = Number(manualBid);
    if (Number.isNaN(num)) {
      setParsedBid(0);
      setIsValid(false);
      setError("Enter a valid number");
      return;
    }

    setParsedBid(num);

    if (num < minBid) {
      setIsValid(false);
      setError(`Minimum bid is ${currency.format(minBid)}`);
      return;
    }

    // Optional: Validate step increment if strictly enforced
    // (num - currentPrice) % step == 0 ?
    // For now, loose validation

    setIsValid(true);
    setError("");
  }, [manualBid, minBid]);

  const handlePlaceBid = async (event) => {
    event.preventDefault();
    if (!isValid) return;
    if (!product?.id) return;

    try {
      setLoading(true);
      setError("");

      await bidService.placeBid({
        product_id: product.id,
        amount: parsedBid,
      });

      alert("Đặt giá thầu thành công!");
      onClose();

      window.location.reload();
    } catch (err) {
      console.error("Bid error:", err);
      setError(
        err.response?.data?.message || "Đặt giá thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    setManualBid(String(minBid));
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
                        {currency.format(currentPrice)}
                      </p>
                    </div>
                    {product.end_time && (
                      <div className="text-sm text-gray-500">
                        Ends:{" "}
                        {new Date(product.end_time).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>

                  {/* Auto-increment / Suggestion */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">
                      Quick bid
                    </h3>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                    <div>
                      Suggested next bid:{" "}
                      <span className="font-medium text-gray-900">
                        {currency.format(minBid)}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        style={{
                          padding: `4px ${SPACING.M}`,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1.5px solid ${COLORS.MORNING_MIST}`,
                          cursor: "pointer",
                          fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                          marginLeft: SPACING.M,
                        }}
                        className="hover:opacity-90 transition-all"
                      >
                        Use suggestion
                      </button>
                    </div>
                  </div>

                  {/* Manual bid input & feedback */}
                  <form onSubmit={handlePlaceBid} className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Your bid amount
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative w-full">
                        <input
                          type="number"
                          value={manualBid}
                          onChange={(e) => setManualBid(e.target.value)}
                          placeholder={minBid}
                          className={`w-full rounded-md border px-3 py-2 text-lg focus:ring-2 focus:ring-indigo-500 ${
                            !eligibility.allowed
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!eligibility.allowed}
                        />
                      </div>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                    {isValid && (
                      <p className="mt-2 text-sm text-green-600">
                        Valid bid: {currency.format(parsedBid)}
                      </p>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={!isValid || !eligibility.allowed}
                        style={{
                          backgroundColor:
                            isValid && eligibility.allowed
                              ? COLORS.MIDNIGHT_ASH
                              : "#d1d5db",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "9999px",
                          width: "100%",
                          fontWeight: "600",
                          cursor:
                            isValid && eligibility.allowed
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        Place Bid
                      </button>
                    </div>

                    {!eligibility.allowed && (
                      <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="font-semibold mb-1">
                          ⚠️ Cannot Place Bid
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
