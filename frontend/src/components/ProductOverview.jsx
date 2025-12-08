"use client";

import { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import BiddingQuickView from "./BiddingQuickView";
import productService from "../services/productService";
import watchlistService from "../services/watchlistService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview() {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();

  const [showBidQuickView, setShowBidQuickView] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  const openBidQuickView = () => {
    setShowBidQuickView(true);
  };
  const closeBidQuickView = () => setShowBidQuickView(false);

  useEffect(() => {
    const p = productService.getProduct();
    setProduct(p);
    setSelectedColor(p?.colors?.[0] || null);
    if (p && p.id) setInWatchlist(watchlistService.isInWatchlist(p.id));

    if (p) {
      const ended = new Date(p.dueTime) <= new Date();
      setIsEnded(ended);
      const user = localStorage.getItem("userName");
      if (user && p.highestBidder?.name === user) {
        setIsWinner(true);
      }
    }
  }, []);

  // submitBid removed: bid handling is done in BiddingQuickView for now

  if (!product) return null;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {product.images.map((image) => (
                  <Tab
                    key={image.id}
                    className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:ring-3 focus:ring-indigo-500/50 focus:ring-offset-4 focus:outline-hidden"
                  >
                    <span className="sr-only">{image.name}</span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <img
                        alt=""
                        src={image.src}
                        className="size-full object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2 group-data-selected:ring-indigo-500"
                    />
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels>
              {product.images.map((image) => (
                <TabPanel key={image.id}>
                  <img
                    alt={image.alt}
                    src={image.src}
                    className="aspect-square w-full object-cover sm:rounded-lg"
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                $
                {product.highestBid
                  ? product.highestBid.toFixed(2)
                  : product.price.toFixed(2)}
              </p>
              {product.buyNowPrice && (
                <div className="mt-1 text-sm text-gray-600">
                  Buy it now:{" "}
                  <span className="font-medium text-gray-900">
                    ${product.buyNowPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      aria-hidden="true"
                      className={classNames(
                        product.rating > rating
                          ? "text-indigo-500"
                          : "text-gray-300",
                        "size-5 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{product.rating} out of 5 stars</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 font-bold">
              <p>Posted: {new Date(product.postedAt).toLocaleString()}</p>
              <p>Ends: {new Date(product.dueTime).toLocaleString()}</p>
            </div>

            {/* Seller & Highest bidder */}
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.seller.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.seller.rating} · {product.seller.totalReviews}{" "}
                    reviews
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">Current high by</div>
                <div className="text-sm font-medium text-gray-900">
                  {product.highestBidder?.name || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {product.highestBidder?.rating
                    ? `· ${product.highestBidder.rating} ★`
                    : ""}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="space-y-6 text-base text-gray-700"
              />
            </div>

            <form className="mt-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-600">Color</h3>

                <fieldset aria-label="Choose a color" className="mt-2">
                  <RadioGroup
                    value={selectedColor}
                    onChange={setSelectedColor}
                    className="flex items-center gap-x-3"
                  >
                    {product.colors.map((color) => (
                      <Radio
                        key={color.name}
                        value={color}
                        aria-label={color.name}
                        className={classNames(
                          color.selectedColor,
                          "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden data-checked:ring-2 data-focus:data-checked:ring-3 data-focus:data-checked:ring-offset-1"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={classNames(
                            color.bgColor,
                            "size-8 rounded-full border border-black/10"
                          )}
                        />
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                {isEnded ? (
                  isWinner ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/transactions/tx-ziptote`)}
                      style={{
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        width: "100%",
                      }}
                      className="hover:opacity-90"
                    >
                      Pay now
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: SPACING.M,
                      }}
                    >
                      <div
                        style={{
                          padding: SPACING.M,
                          backgroundColor: COLORS.SOFT_CLOUD,
                          color: COLORS.MIDNIGHT_ASH,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          textAlign: "center",
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                        }}
                      >
                        This auction has ended.
                      </div>
                      {/* Seller view - can access transaction */}
                      <button
                        type="button"
                        onClick={() => navigate(`/transactions/tx-ziptote`)}
                        style={{
                          backgroundColor: COLORS.MIDNIGHT_ASH,
                          color: COLORS.WHITE,
                          borderRadius: BORDER_RADIUS.FULL,
                          padding: `${SPACING.S} ${SPACING.L}`,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.2s ease",
                          width: "100%",
                        }}
                        className="hover:opacity-90"
                      >
                        View Transaction (Seller)
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openBidQuickView}
                      style={{
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        width: "100%",
                      }}
                      className="hover:opacity-90"
                    >
                      Place bid
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!product) return;
                        if (inWatchlist) {
                          navigate("/watchlists");
                          return;
                        }
                        watchlistService.addToWatchlist(product);
                        setInWatchlist(true);
                      }}
                      style={{
                        backgroundColor: inWatchlist ? "#d1d5db" : COLORS.WHITE,
                        color: inWatchlist ? "#1f2937" : COLORS.MIDNIGHT_ASH,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        border: `1.5px solid ${COLORS.MORNING_MIST}`,
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        width: "100%",
                      }}
                      className="hover:opacity-90"
                    >
                      <HeartIcon
                        aria-hidden="true"
                        className="size-6 mr-2 inline"
                      />
                      {inWatchlist ? "In Watchlist — View" : "Add to watchlist"}
                    </button>

                    <button
                      type="button"
                      style={{
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        width: "100%",
                      }}
                      className="hover:opacity-90"
                    >
                      Buy it now
                    </button>

                    <button
                      type="button"
                      style={{
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        width: "100%",
                      }}
                      className="hover:opacity-90"
                    >
                      Add to bag
                    </button>
                  </>
                )}
              </div>
            </form>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t">
                {product.details.map((detail) => (
                  <Disclosure key={detail.name} as="div">
                    <h3>
                      <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                        <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                          {detail.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      <ul
                        role="list"
                        className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
                      >
                        {detail.items.map((item) => (
                          <li key={item} className="pl-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* Quick view modal (controlled) */}
      <BiddingQuickView open={showBidQuickView} onClose={closeBidQuickView} />
    </div>
  );
}
