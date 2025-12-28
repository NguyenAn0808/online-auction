"use client";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import EditProductModal from "./EditProductModal";
import EditDescriptionModal from "./EditDescriptionModal";
import { productService } from "../services/productService";
import watchlistService from "../services/watchlistService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview({ productId: propProductId }) {
  const { user } = useAuth(); // Check if user is logged in
  const { productId: paramProductId } = useParams();
  const productId = propProductId || paramProductId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();

  const [showBidQuickView, setShowBidQuickView] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditDescOpen, setIsEditDescOpen] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const data = await productService.getProductById(productId);
        setProduct(data);

        // Check watchlist status
        setInWatchlist(watchlistService.isInWatchlist(productId));

        // Check if ended
        if (data.end_time) {
          const ended = new Date(data.end_time) <= new Date();
          setIsEnded(ended);
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const openBidQuickView = () => {
    setShowBidQuickView(true);
  };
  const closeBidQuickView = () => setShowBidQuickView(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);
  const openEditDesc = () => setIsEditDescOpen(true);
  const closeEditDesc = () => setIsEditDescOpen(false);

  const handleUpdateProduct = async (productId, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        start_price: data.start_price,
        step_price: data.step_price,
        buy_now_price: data.buy_now_price ?? null,
        allow_unrated_bidder: !!data.allow_unrated_bidder,
        auto_extend: !!data.auto_extend,
      };
      await productService.updateProduct(productId, payload);
      alert("Product updated successfully!");
      // Reload product to reflect changes
      const updated = await productService.getProductById(productId);
      setProduct(updated);
    } catch (e) {
      alert("Failed to update product");
    }
  };

  const requireAuth = (actionCallback) => {
    if (!user) {
      navigate("/auth/signin", { state: { from: location } });
      return;
    }
    actionCallback();
  };

  const handleUpdateDescription = async (productId, data) => {
    // Implement if backend supports description history
    console.log("Description added:", data);
    alert("Description added successfully!");
  };

  const handleBidClick = () => {
    requireAuth(() => {
      setShowBidQuickView(true);
    });
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      navigate(`/transactions?productId=${product.id}`);
    });
  };

  const handleAddToBag = () => {
    requireAuth(() => {
      console.log("Added to bag!");
    });
  };

  if (loading)
    return <div className="p-10 text-center">Loading product details...</div>;
  if (error || !product)
    return (
      <div className="p-10 text-center">{error || "Product not found."}</div>
    );

  // Derive display values from backend data
  const currentPrice = Number(
    product.current_price || product.start_price || 0
  );
  const buyNowPrice = Number(product.buy_now_price || 0);
  const stepPrice = Number(product.step_price || 0);

  // Images: Backend returns 'images' array and 'thumbnail' string
  // Standardize to array for gallery
  let normalizedImages = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    normalizedImages = product.images.map((img, index) => ({
      id: img.id || `img-${index}`,
      src: img.image_url || img.src || img.url,
      alt: img.alt || product.name,
      is_thumbnail: img.is_thumbnail,
      position: img.position || index,
    }));
    // Sort by position, thumbnails first
    normalizedImages.sort((a, b) => {
      if (a.is_thumbnail && !b.is_thumbnail) return -1;
      if (!a.is_thumbnail && b.is_thumbnail) return 1;
      return a.position - b.position;
    });
  } else if (product.thumbnail) {
    normalizedImages = [
      { id: "thumb", src: product.thumbnail, alt: product.name },
    ];
  } else {
    normalizedImages = [
      { id: "def", src: "/images/sample.jpg", alt: "Default" },
    ];
  }

  // Category info
  const categoryName = product.category_name || "Uncategorized";

  // Seller info (mock for now as backend doesn't return seller details yet)
  const sellerName = product.seller_name || "Seller";
  const sellerRating = product.seller_rating || null;

  // Auction status
  const endTime = product.end_time ? new Date(product.end_time) : null;
  const startTime = product.start_time ? new Date(product.start_time) : null;
  const status = product.status || "active";
  const autoExtend = product.auto_extend;
  const allowUnratedBidder = product.allow_unrated_bidder;

  return (
    <div style={{ backgroundColor: COLORS.WHISPER }}>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {normalizedImages.map((image) => (
                  <Tab
                    key={image.id}
                    className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md uppercase focus:ring-3 focus:ring-offset-4 focus:outline-hidden"
                    style={{
                      backgroundColor: COLORS.WHITE,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.SOFT_CLOUD;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.WHITE;
                    }}
                  >
                    <span className="sr-only">Image</span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <img
                        alt=""
                        src={image.src}
                        className="size-full object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2"
                      style={{
                        ringColor: COLORS.MIDNIGHT_ASH,
                      }}
                    />
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels>
              {normalizedImages.map((image) => (
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
            <div className="flex items-center gap-5">
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                  letterSpacing: "-0.025em",
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                {product.name}
              </h1>

              {user?.role === "admin" && (
                <button
                  type="button"
                  onClick={openEdit}
                  style={{
                    borderRadius: BORDER_RADIUS.FULL,
                    border: `1px solid ${COLORS.MORNING_MIST}`,
                    backgroundColor: COLORS.WHITE,
                    padding: SPACING.XS,
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.SOFT_CLOUD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.WHITE;
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mt-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: COLORS.SOFT_CLOUD,
                  color: COLORS.PEBBLE,
                }}
              >
                {categoryName}
              </span>
              {status !== "active" && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )}
            </div>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p
                style={{
                  fontSize: "1.875rem",
                  letterSpacing: "-0.025em",
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                {currentPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>
              <div
                className="mt-1"
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  color: COLORS.PEBBLE,
                }}
              >
                Starting price:{" "}
                <span
                  style={{
                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  {Number(product.start_price || 0).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              </div>
              {stepPrice > 0 && (
                <div
                  className="mt-1"
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    color: COLORS.PEBBLE,
                  }}
                >
                  Bid increment:{" "}
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {stepPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>
              )}
              {buyNowPrice > 0 && (
                <div
                  className="mt-1"
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    color: COLORS.PEBBLE,
                  }}
                >
                  Buy it now:{" "}
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: "#16a34a",
                    }}
                  >
                    {buyNowPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: COLORS.MORNING_MIST,
                    color: COLORS.PEBBLE,
                  }}
                >
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {sellerName}
                  </div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {sellerRating ? `Rating: ${sellerRating}` : "Seller"}
                  </div>
                </div>
              </div>
            </div>

            {/* Auction Timing */}
            <div
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor: COLORS.SOFT_CLOUD,
                borderRadius: BORDER_RADIUS.MEDIUM,
              }}
            >
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  color: COLORS.PEBBLE,
                }}
              >
                {startTime && (
                  <p>
                    <span
                      style={{
                        fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      Started:
                    </span>{" "}
                    {startTime.toLocaleString()}
                  </p>
                )}
                <p className="mt-1">
                  <span
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Ends:
                  </span>{" "}
                  {endTime ? endTime.toLocaleString() : "N/A"}
                </p>
                {autoExtend && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: "#2563eb",
                    }}
                  >
                    ⏱️ Auto-extend enabled (extends if bid placed near end)
                  </p>
                )}
                {!allowUnratedBidder && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: "#ea580c",
                    }}
                  >
                    ⚠️ Only rated bidders can participate
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <h3
                style={{
                  fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Description
              </h3>
              <div
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                  color: COLORS.MIDNIGHT_ASH,
                  lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            <form className="mt-6">
              <div className="mt-10 flex flex-col gap-4">
                {isEnded ? (
                  <div
                    className="p-4 rounded text-center"
                    style={{
                      backgroundColor: COLORS.SOFT_CLOUD,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    This auction has ended.
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBidClick}
                      style={{
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        color: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      }}
                      className="w-full hover:opacity-90"
                    >
                      Place bid
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (inWatchlist) {
                          navigate("/watchlists"); // or specific user watchlist
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
                        border: `1.5px solid ${COLORS.MORNING_MIST}`,
                      }}
                      className="w-full flex items-center justify-center hover:opacity-90"
                    >
                      <HeartIcon className="size-6 mr-2 inline" />
                      {inWatchlist ? "In Watchlist" : "Add to watchlist"}
                    </button>

                    {buyNowPrice > 0 && (
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        style={{
                          backgroundColor: COLORS.MIDNIGHT_ASH,
                          color: COLORS.WHITE,
                          borderRadius: BORDER_RADIUS.FULL,
                          padding: `${SPACING.S} ${SPACING.L}`,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        }}
                        className="w-full hover:opacity-90 mt-2"
                      >
                        Buy it now
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick view modal */}
      <BiddingQuickView
        open={showBidQuickView}
        onClose={closeBidQuickView}
        product={product}
      />

      {/* Edit product modal */}
      {isEditOpen && (
        <EditProductModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          product={product}
          onUpdate={handleUpdateProduct}
        />
      )}

      {/* Edit description modal */}
      {isEditDescOpen && (
        <EditDescriptionModal
          isOpen={isEditDescOpen}
          onClose={closeEditDesc}
          product={product}
          onUpdate={handleUpdateDescription}
        />
      )}
    </div>
  );
}
