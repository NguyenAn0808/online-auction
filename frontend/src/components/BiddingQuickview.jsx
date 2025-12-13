"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Radio,
  RadioGroup,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";

import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BiddingQuickView({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [autoOption, setAutoOption] = useState(null); // 'plus5' | 'plus10' | 'max'
  const [manualBid, setManualBid] = useState("");
  const [parsedBid, setParsedBid] = useState(0);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [eligibility, setEligibility] = useState({ allowed: true, score: 1 });

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const currentPrice = product
    ? parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0
    : 0;
  const minBid = Math.max(1, Math.round((currentPrice + 1) * 100) / 100);
  const maxBid = Math.max(minBid, Math.round(currentPrice * 10 * 100) / 100);
  const step = 1;

  useEffect(() => {
    // derive manual bid from auto option when selected
    if (!autoOption) return;
    let value = currentPrice;
    if (autoOption === "plus5") value = +(currentPrice * 1.05).toFixed(2);
    if (autoOption === "plus10") value = +(currentPrice * 1.1).toFixed(2);
    if (autoOption === "max") value = maxBid;
    setManualBid(String(value));
  }, [autoOption, currentPrice, maxBid]);

  useEffect(() => {
    // parse manualBid and validate
    const num = parseFloat(String(manualBid).replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num)) {
      setParsedBid(0);
      setIsValid(false);
      setError(manualBid === "" ? "" : "Enter a valid number");
      return;
    }

    setParsedBid(num);
    if (num < minBid) {
      setIsValid(false);
      setError(`Minimum bid is ${currency.format(minBid)}`);
      return;
    }
    if (num > maxBid) {
      setIsValid(false);
      setError(`Maximum bid is ${currency.format(maxBid)}`);
      return;
    }
    // step validation: ensure (num - minBid) is multiple of step (allow float rounding)
    const diff = Math.abs(((num - minBid) / step) % 1);
    if (diff > 1e-6 && Math.abs(diff - 1) > 1e-6) {
      setIsValid(false);
      setError(`Bid increments must be in ${step} unit steps`);
      return;
    }

    setIsValid(true);
    setError("");
  }, [manualBid, minBid, maxBid]);

  useEffect(() => {
    const p = productService.getProduct();
    setProduct(p);
    setSelectedColor(p?.colors?.[0] || null);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "You";
    const e = productService.getBidEligibility(name === "You" ? null : name);
    setEligibility(e);
  }, [product]);

  const handleManualChange = (e) => {
    setAutoOption(null);
    setManualBid(e.target.value);
  };

  const getBidEligibility = (name) => {
    return productService.getBidEligibility(name);
  };

  const handlePlaceBid = (event) => {
    event.preventDefault();
    if (!isValid) return;
    const name = localStorage.getItem("userName") || "You";
    const eli = getBidEligibility(name === "You" ? null : name);
    if (!eli.allowed) {
      alert(
        "Your rating does not meet the seller's requirement to place a bid."
      );
      return;
    }

    // Client-side only: show console log and close modal
    console.log("Placing bid:", parsedBid);
    // persist bid locally using current user name
    productService.placeBid({
      name: name === "You" ? "You" : name,
      amount: parsedBid,
    });
    // In a real app, call API here and handle response
    onClose(false);
    // navigate to bidding page (create a temporary bidId using timestamp)
    const bidId = Date.now();
    navigate(`/bids/${bidId}`);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
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
            <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
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
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
                  />
                </div>
                <div className="sm:col-span-8 lg:col-span-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-lg text-gray-700">
                        {product.price}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Ends: {new Date(product.dueTime).toLocaleString()}
                    </div>
                  </div>

                  {/* color selector (compact) */}
                  <div className="mt-4">
                    <RadioGroup
                      value={selectedColor}
                      onChange={setSelectedColor}
                      className="flex items-center gap-2"
                    >
                      {product.colors.map((color) => (
                        <Radio
                          key={color.name}
                          value={color}
                          className={({ checked }) =>
                            classNames(
                              checked ? "ring-2 ring-indigo-500" : "",
                              "relative inline-flex cursor-pointer items-center justify-center rounded-full p-1"
                            )
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={classNames(
                              color.bgColor,
                              "size-6 rounded-full border border-black/10"
                            )}
                          />
                          <span className="sr-only">{color.name}</span>
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Auto-increment options */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">
                      Quick bid
                    </h3>
                  </div>

                  {/* Suggested next bid */}
                  <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                    <div>
                      Suggested next bid:{" "}
                      <span className="font-medium text-gray-900">
                        {currency.format(productService.suggestNextBid())}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setManualBid(String(productService.suggestNextBid()))
                        }
                        style={{
                          padding: `4px ${SPACING.M}`,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor: COLORS.WHITE,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1.5px solid ${COLORS.MORNING_MIST}`,
                          cursor: "pointer",
                          fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                          transition: "all 0.2s ease",
                          marginLeft: SPACING.M,
                          minHeight: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className="hover:opacity-90"
                      >
                        Use suggestion
                      </button>
                    </div>
                  </div>

                  {/* Manual bid input & feedback */}
                  <form onSubmit={handlePlaceBid} className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Your max bid
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={manualBid}
                        onChange={handleManualChange}
                        placeholder={currency.format(minBid)}
                        disabled={!eligibility.allowed}
                        className={classNames(
                          !eligibility.allowed
                            ? "opacity-50 cursor-not-allowed"
                            : "",
                          "w-full rounded-md border px-3 py-2 text-lg focus:ring-2 focus:ring-indigo-500"
                        )}
                      />
                      <div className="text-right text-sm text-gray-500 min-w-28">
                        {isValid ? (
                          <div className="text-green-600">
                            {currency.format(parsedBid)}
                          </div>
                        ) : (
                          <div className="text-red-600">{error}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={!isValid || !eligibility.allowed}
                        style={{
                          padding: `4px ${SPACING.L}`,
                          borderRadius: BORDER_RADIUS.FULL,
                          backgroundColor:
                            isValid && eligibility.allowed
                              ? COLORS.MIDNIGHT_ASH
                              : "#d1d5db",
                          color:
                            isValid && eligibility.allowed
                              ? COLORS.WHITE
                              : "#6b7280",
                          border: "none",
                          cursor:
                            isValid && eligibility.allowed
                              ? "pointer"
                              : "not-allowed",
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          transition: "opacity 0.2s ease",
                          width: "100%",
                          minHeight: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className={
                          isValid && eligibility.allowed
                            ? "hover:opacity-90"
                            : ""
                        }
                      >
                        Place bid
                      </button>
                    </div>
                  </form>

                  {/* Eligibility status */}
                  <div className="mt-4">
                    {eligibility.allowed ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                        ✓ Your ratings score:{" "}
                        <strong>
                          {Math.round((eligibility.score || 0) * 100)}%
                        </strong>{" "}
                        - You are allowed to participate in the auction
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                        ✗ Your ratings score:{" "}
                        <strong>
                          {Math.round((eligibility.score || 0) * 100)}%
                        </strong>{" "}
                        - Minimum required <strong>80%</strong>
                        <p className="mt-2">
                          Please improve your ratings score by completing
                          successful transactions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
