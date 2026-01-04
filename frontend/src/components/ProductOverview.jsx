"use client";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Radio,
  RadioGroup,
} from "@headlessui/react";
import { StarIcon, HeartIcon as HeartSolid } from "@heroicons/react/20/solid";
import {
  HeartIcon as HeartOutline,
  MinusIcon,
  PlusIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import BiddingQuickView from "./BiddingQuickView";
import EditDescriptionModal from "./EditDescriptionModal";
import { productService } from "../services/productService";
import watchlistService from "../services/watchlistService";
import userService from "../services/userService";
import orderService from "../services/orderService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import { useAuctionPolling } from "../hooks/useAuctionPolling";
import { useBidPolling } from "../hooks/useBidPolling";
import { useAuctionCountdown } from "../hooks/useAuctionCountdown";

// Format date to DD/MM/YYYY
function formatDescriptionDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Mask display name: mask every other character ('nndkhoa' → 'n*d*h*a')
function maskDisplayName(name) {
  if (!name || typeof name !== "string") return "-";
  const trimmed = name.trim().replace(/\s+/g, "");
  if (trimmed.length < 2) return "*".repeat(trimmed.length);
  // Mask every other character
  let masked = "";
  for (let i = 0; i < trimmed.length; i++) {
    masked += i % 2 === 0 ? trimmed[i] : "*";
  }
  return masked;
}

// Decode HTML entities if backend stored/returned escaped HTML.
function decodeHtmlEntities(html) {
  if (!html) return "";
  const raw = String(html);
  if (typeof document === "undefined") return raw;
  try {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = raw;
    let decoded = textarea.value;
    // Handle common double-encoding (e.g., &amp;lt;p&amp;gt;)
    if (decoded.includes("&lt;") || decoded.includes("&gt;")) {
      textarea.innerHTML = decoded;
      decoded = textarea.value;
    }
    return decoded;
  } catch {
    return raw;
  }
}

// Basic HTML sanitizer: strips script tags + inline event handlers.
function sanitizeHtml(html) {
  if (!html) return "";
  try {
    return String(html)
      .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis, "")
      .replace(/on[a-zA-Z]+\s*=\s*"[^"]*"/g, "")
      .replace(/on[a-zA-Z]+\s*=\s*'[^']*'/g, "");
  } catch {
    return String(html);
  }
}

function getSafeDescriptionHtml(html) {
  return sanitizeHtml(decodeHtmlEntities(html));
}

export default function ProductOverview({ productId: propProductId }) {
  const { user } = useAuth(); // Check if user is logged in
  const { productId: paramProductId } = useParams();
  const productId = propProductId || paramProductId;
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();

  const [showBidQuickView, setShowBidQuickView] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isEditDescOpen, setIsEditDescOpen] = useState(false);
  const [descriptionHistory, setDescriptionHistory] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  // Product image slideshow
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imageCount =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images.length
      : product?.thumbnail
      ? 1
      : 1;

  useEffect(() => {
    // reset slide on product change
    setActiveImageIndex(0);
  }, [productId]);

  useEffect(() => {
    // keep index in range
    setActiveImageIndex((prev) => {
      if (!imageCount || imageCount <= 0) return 0;
      return Math.min(prev, imageCount - 1);
    });
  }, [imageCount]);

  useEffect(() => {
    if (imageCount <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [imageCount]);

  // ✨ Real-time polling hooks
  const { auctionData } = useAuctionPolling(productId);
  const { bids, highestBid, bidCount } = useBidPolling(productId);
  const { timeRemaining, hasEnded } = useAuctionCountdown(
    auctionData?.end_time || product?.end_time,
    () => {
      console.log("Auction ended!");
      setIsEnded(true);
    }
  );

  // Fetch description history
  const fetchDescriptionHistory = useCallback(async () => {
    if (!productId) return;
    try {
      const history = await productService.getDescriptionHistory(productId);
      setDescriptionHistory(history || []);
    } catch (err) {
      console.error("Failed to load description history:", err);
      // Fallback: use product.description if API fails
      if (product?.description) {
        setDescriptionHistory([
          {
            id: "initial",
            content: product.description,
            created_at: product.created_at || new Date().toISOString(),
            type: "initial",
          },
        ]);
      }
    }
  }, [productId, product?.description, product?.created_at]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const data = await productService.getProductById(productId);
        setProduct(data);

        // Fetch seller information
        if (data.seller_id) {
          try {
            const seller = await userService.getUserById(data.seller_id);
            setSellerInfo(seller);
          } catch (err) {
            console.error("Failed to load seller info", err);
            // Continue even if seller fetch fails
          }
        }

        // Check watchlist status
        setInWatchlist(watchlistService.isInWatchlist(productId));

        // Check if ended (initially)
        if (data.end_time) {
          const ended = new Date(data.end_time) <= new Date();
          setIsEnded(ended);

          // If ended, fetch order data for winner/seller UI
          if (ended && user) {
            try {
              const orderData = await orderService.getOrder(productId);
              setOrder(orderData);

              // Auto-redirect if user is buyer or seller
              if (
                orderData &&
                (orderData.buyer_id === user.id ||
                  orderData.seller_id === user.id)
              ) {
                navigate(`/transactions/${orderData.id}`);
                return;
              }
            } catch (err) {
              console.error("Failed to load order", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate, user]);

  // Update product data when polling detects changes
  useEffect(() => {
    if (auctionData) {
      setProduct((prev) => ({
        ...prev,
        ...auctionData,
        // ALWAYS prioritize actual product table data over inferred highest bid
        current_price: auctionData.current_price ?? prev?.current_price,
        price_holder: auctionData.price_holder ?? prev?.price_holder,
        price_holder_name:
          auctionData.price_holder_name ?? prev?.price_holder_name,
      }));
    }
  }, [auctionData]);

  // Fetch description history when product is loaded
  useEffect(() => {
    if (product?.id) {
      fetchDescriptionHistory();
    }
  }, [product?.id, fetchDescriptionHistory]);

  const closeBidQuickView = () => setShowBidQuickView(false);
  const openEditDesc = () => setIsEditDescOpen(true);
  const closeEditDesc = () => setIsEditDescOpen(false);

  const requireAuth = (actionCallback) => {
    if (!user) {
      // Navigate to signin using React Router
      const currentPath = encodeURIComponent(location.pathname);
      navigate(`/auth/signin?from=${currentPath}`);
      return;
    }
    actionCallback();
  };

  const handleUpdateDescription = async () => {
    // Refresh description history after adding new description
    await fetchDescriptionHistory();
  };

  const handleBidClick = () => {
    requireAuth(() => {
      setShowBidQuickView(true);
    });
  };

  const { addToCart } = useCart();
  const handleBuyNow = () => {
    requireAuth(() => {
      if (product) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.buy_now_price || product.price || 0,
          imageSrc: product.images?.[0]?.url || "",
          imageAlt: product.name,
          color: product.color || "",
          href: `/products/${product.id}`,
        });
      }
    });
  };

  const safeProductDescriptionHtml = useMemo(
    () => getSafeDescriptionHtml(product?.description),
    [product?.description]
  );

  if (loading)
    return <div className="p-10 text-center">Loading product details...</div>;
  if (error || !product)
    return (
      <div className="p-10 text-center">{error || "Product not found."}</div>
    );

  // Determine user role for auction ended state
  const isWinnerUser =
    user && (user.id === product?.price_holder || order?.buyer_id === user.id);
  const isSellerUser = user && user.id === product?.seller_id;

  // Derive display values from backend data
  // Priority: 1) highest bid from polling, 2) product.current_price, 3) start_price
  // Calculate highest bid manually from bids array if highestBid is null
  let calculatedHighestBid = highestBid?.amount;

  if (!calculatedHighestBid && Array.isArray(bids) && bids.length > 0) {
    // Filter out rejected bids, only count pending or accepted bids
    const activeBids = bids.filter((bid) => bid.status !== "rejected");

    if (activeBids.length > 0) {
      const maxBid = activeBids.reduce((max, bid) => {
        const bidAmount = Number(bid.amount || bid.max_bid || 0);
        return bidAmount > max ? bidAmount : max;
      }, 0);
      calculatedHighestBid = maxBid > 0 ? maxBid : null;
    }
  }

  const currentPrice = calculatedHighestBid
    ? Number(calculatedHighestBid)
    : Number(product.current_price || product.start_price || 0);

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

  // Seller info
  const sellerName =
    sellerInfo?.fullName ||
    sellerInfo?.full_name ||
    product.seller_id ||
    "Seller";

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
          <div className="flex flex-col-reverse">
            {/* Thumbnails */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {normalizedImages.map((image, index) => {
                  const isActive = index === activeImageIndex;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={
                        "group relative flex h-24 cursor-pointer items-center justify-center rounded-md focus:outline-hidden " +
                        (isActive
                          ? "ring-2 ring-offset-2 ring-gray-900"
                          : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300")
                      }
                      style={{
                        backgroundColor: COLORS.WHITE,
                      }}
                      aria-label={`View image ${index + 1}`}
                    >
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        <img
                          alt={image.alt}
                          src={image.src}
                          className="size-full object-cover"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slideshow */}
            <div className="relative aspect-square w-full overflow-hidden sm:rounded-lg bg-white">
              {normalizedImages.map((image, index) => (
                <div
                  key={image.id}
                  className={
                    "absolute inset-0 transition-opacity duration-700 ease-in-out " +
                    (index === activeImageIndex
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none")
                  }
                >
                  <img
                    alt={image.alt}
                    src={image.src}
                    className="size-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}

              {normalizedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) =>
                          (prev - 1 + normalizedImages.length) %
                          normalizedImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-5 h-5 text-gray-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m15 19-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (prev) => (prev + 1) % normalizedImages.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-5 h-5 text-gray-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m9 5 7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

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

              {/* Admin product edit button removed */}
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
                {`Current price: `}
                {currentPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>

              {/* Winning Bidder Info - Source of Truth: product.price_holder */}
              {product.price_holder && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div
                    className="text-sm font-medium"
                    style={{
                      color:
                        product.price_holder === user?.id
                          ? "#16a34a"
                          : COLORS.MIDNIGHT_ASH,
                      backgroundColor:
                        product.price_holder === user?.id
                          ? "#f0fdf4"
                          : COLORS.SOFT_CLOUD,
                      padding: "4px 12px",
                      borderRadius: BORDER_RADIUS.FULL,
                      display: "inline-block",
                    }}
                  >
                    🏆{" "}
                    {product.price_holder === user?.id
                      ? "You are currently winning!"
                      : `${
                          product.price_holder_name
                            ? maskDisplayName(product.price_holder_name)
                            : "A bidder"
                        } is currently winning`}
                  </div>
                  {product.price_holder !== user?.id && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/user/${product.price_holder}/ratings`)
                      }
                      className="text-xs underline hover:opacity-70 transition-opacity"
                      style={{
                        color: COLORS.PEBBLE,
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      View Ratings
                    </button>
                  )}
                </div>
              )}
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
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/user/${product.seller_id}/ratings`)
                      }
                      className="underline hover:opacity-70 transition-opacity"
                      style={{
                        color: COLORS.PEBBLE,
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                      }}
                    >
                      View Ratings
                    </button>
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
                    {hasEnded ? "Ended:" : "Time remaining:"}
                  </span>{" "}
                  {hasEnded
                    ? endTime
                      ? endTime.toLocaleString()
                      : "Ended"
                    : timeRemaining?.formatted || "Calculating..."}
                </p>
                {!hasEnded && bidCount > 0 && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {`Bid counts: `} {bidCount} bid{bidCount !== 1 ? "s" : ""}
                  </p>
                )}
                {autoExtend && (
                  <p
                    className="mt-1 italic"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Auto-extend enabled
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

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-left gap-2">
                <h3
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Description
                </h3>
                {(user?.id === product.seller_id || user?.role === "admin") && (
                  <PencilIcon
                    className="size-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={openEditDesc}
                  />
                )}
              </div>

              {/* Description History - Format: ✏️ **DD/MM/YYYY** - content */}
              <div className="space-y-4">
                {descriptionHistory.length > 0 ? (
                  descriptionHistory.map((desc) => (
                    <div
                      key={desc.id}
                      className="p-4 rounded-lg border border-gray-200 bg-white"
                    >
                      <div
                        className="flex items-center gap-2 mb-2"
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        <span style={{ fontWeight: TYPOGRAPHY.WEIGHT_BOLD }}>
                          {formatDescriptionDate(desc.created_at)}
                        </span>
                        {desc.type === "initial" && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: COLORS.SOFT_CLOUD,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            Initial
                          </span>
                        )}
                      </div>
                      <div
                        className="[&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_blockquote]:pl-4 [&_blockquote]:border-l-4"
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                          color: COLORS.MIDNIGHT_ASH,
                          lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: getSafeDescriptionHtml(desc.content),
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    className="p-4 rounded-lg border border-gray-200 bg-white [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_blockquote]:pl-4 [&_blockquote]:border-l-4"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                      color: COLORS.MIDNIGHT_ASH,
                      lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: safeProductDescriptionHtml,
                    }}
                  />
                )}
              </div>
            </div>

            <form className="mt-6" noValidate>
              <div className="mt-10 flex flex-col gap-4">
                {isEnded ? (
                  // Role-based UI when auction has ended
                  <>
                    {isWinnerUser ? (
                      // Winner UI
                      <div
                        style={{
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          backgroundColor: "#ECFDF5",
                          border: "1px solid #10B981",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: SPACING.S,
                            padding: `${SPACING.XS} ${SPACING.M}`,
                            backgroundColor: "#10B981",
                            color: COLORS.WHITE,
                            borderRadius: BORDER_RADIUS.FULL,
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            marginBottom: SPACING.M,
                          }}
                        >
                          🎉 You Won!
                        </div>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Congratulations! You are the winning bidder.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              order
                                ? `/transactions/${order.id}`
                                : `/transactions/${productId}`
                            )
                          }
                          style={{
                            backgroundColor: "#10B981",
                            color: COLORS.WHITE,
                            borderRadius: BORDER_RADIUS.FULL,
                            padding: `${SPACING.S} ${SPACING.L}`,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            border: "none",
                            cursor: "pointer",
                            width: "100%",
                          }}
                          className="hover:opacity-90"
                        >
                          {order ? "View Transaction" : "Pay Now"}
                        </button>
                      </div>
                    ) : isSellerUser ? (
                      // Seller UI
                      <div
                        style={{
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          backgroundColor: "#EFF6FF",
                          border: "1px solid #3B82F6",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: SPACING.S,
                            padding: `${SPACING.XS} ${SPACING.M}`,
                            backgroundColor: "#3B82F6",
                            color: COLORS.WHITE,
                            borderRadius: BORDER_RADIUS.FULL,
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            marginBottom: SPACING.M,
                          }}
                        >
                          ✓ Auction Completed
                        </div>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Your auction has successfully ended.
                        </p>
                        {order && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/transactions/${order.id}`)
                            }
                            style={{
                              backgroundColor: "#3B82F6",
                              color: COLORS.WHITE,
                              borderRadius: BORDER_RADIUS.FULL,
                              padding: `${SPACING.S} ${SPACING.L}`,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              border: "none",
                              cursor: "pointer",
                              width: "100%",
                            }}
                            className="hover:opacity-90"
                          >
                            Go to Transaction
                          </button>
                        )}
                      </div>
                    ) : (
                      // Loser/Guest UI - Scaled down Auction Ended
                      <div
                        style={{
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          backgroundColor: COLORS.SOFT_CLOUD,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontSize: "32px", marginBottom: SPACING.S }}
                        >
                          ⏱️
                        </div>
                        <h3
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                            marginBottom: SPACING.S,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          Auction Ended
                        </h3>
                        <p
                          style={{
                            color: COLORS.PEBBLE,
                            marginBottom: SPACING.M,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                          }}
                        >
                          This auction has concluded.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/")}
                          style={{
                            backgroundColor: COLORS.MIDNIGHT_ASH,
                            color: COLORS.WHITE,
                            padding: `${SPACING.S} ${SPACING.L}`,
                            borderRadius: BORDER_RADIUS.FULL,
                            border: "none",
                            cursor: "pointer",
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            width: "100%",
                          }}
                          className="hover:opacity-90"
                        >
                          Browse Other Auctions
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  // Active auction UI
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
                        requireAuth(() => {
                          (async () => {
                            try {
                              const userId = user.id;
                              const pid = product?.id;
                              if (!userId || !pid) return;
                              if (inWatchlist) {
                                await watchlistService.removeFromWatchlist(
                                  userId,
                                  pid
                                );
                                setInWatchlist(false);
                              } else {
                                await watchlistService.addToWatchlist(
                                  userId,
                                  pid
                                );
                                setInWatchlist(true);
                              }
                            } catch (e) {
                              console.error("Watchlist toggle failed:", e);
                            }
                          })();
                        });
                      }}
                      style={{
                        backgroundColor: COLORS.WHITE,
                        color: inWatchlist ? "#1f2937" : COLORS.MIDNIGHT_ASH,
                        borderRadius: BORDER_RADIUS.FULL,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        border: `1.5px solid ${COLORS.MORNING_MIST}`,
                      }}
                      className="w-full flex items-center justify-center hover:!bg-gray-50"
                    >
                      {inWatchlist ? (
                        <HeartSolid className="size-6 mr-2 inline text-red-600" />
                      ) : (
                        <HeartOutline className="size-6 mr-2 inline text-black" />
                      )}
                      {inWatchlist ? (
                        <div className="font-semibold">In Watchlist</div>
                      ) : (
                        "Add to watchlist"
                      )}
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
        currentPrice={currentPrice}
      />

      {/* Edit product modal removed */}

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
