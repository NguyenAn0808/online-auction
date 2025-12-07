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

const product = {
  name: "Zip Tote Basket",
  price: "$220",
  rating: 3.9,
  href: "#",
  description:
    "The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.",
  imageSrc:
    "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-04.jpg",
  imageAlt: "Back angled view with bag open and handles to the side.",
  colors: [
    {
      name: "Washed Black",
      bgColor: "bg-gray-700",
      selectedColor: "ring-gray-700",
    },
    { name: "White", bgColor: "bg-white", selectedColor: "ring-gray-400" },
    {
      name: "Washed Gray",
      bgColor: "bg-gray-500",
      selectedColor: "ring-gray-500",
    },
  ],
  dueTime: "2024-12-31T23:59:59Z",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BiddingQuickView({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [autoOption, setAutoOption] = useState(null); // 'plus5' | 'plus10' | 'max'
  const [manualBid, setManualBid] = useState("");
  const [parsedBid, setParsedBid] = useState(0);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const currentPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
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

  const handleManualChange = (e) => {
    setAutoOption(null);
    setManualBid(e.target.value);
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // Client-side only: show console log and close modal
    console.log("Placing bid:", parsedBid);
    // In a real app, call API here and handle response
    onClose(false);
    // navigate to bidding page (create a temporary bidId using timestamp)
    const bidId = Date.now();
    navigate(`/bids/${bidId}`);
  };

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
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAutoOption("plus5")}
                        className={classNames(
                          autoOption === "plus5"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700",
                          "w-24 rounded-md border px-3 py-2 shadow-sm hover:scale-105 transition-transform"
                        )}
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoOption("plus10")}
                        className={classNames(
                          autoOption === "plus10"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700",
                          "w-24 rounded-md border px-3 py-2 shadow-sm hover:scale-105 transition-transform"
                        )}
                      >
                        +10%
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoOption("max")}
                        className={classNames(
                          autoOption === "max"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700",
                          "w-24 rounded-md border px-3 py-2 shadow-sm hover:scale-105 transition-transform"
                        )}
                      >
                        Max
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
                        className="w-full rounded-md border px-3 py-2 text-lg focus:ring-2 focus:ring-indigo-500"
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
                        disabled={!isValid}
                        className={classNames(
                          isValid
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed",
                          "w-full rounded-md px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        )}
                      >
                        Place bid
                      </button>
                    </div>
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
