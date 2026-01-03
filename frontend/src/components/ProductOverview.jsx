"use client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
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
import {
  HeartIcon,
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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Format date to DD/MM/YYYY
function formatDescriptionDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Mask display name: show **** + last 3 characters (no spaces)
function maskDisplayName(name) {
  if (!name || typeof name !== "string") return "-";
  const trimmed = name.trim().replace(/\s+/g, "");
  if (trimmed.length < 3) return "*".repeat(trimmed.length);
  const last3 = trimmed.slice(-3);
  return "****" + last3;
}

export default function ProductOverview({ productId: propProductId }) {
  const { user } = useAuth(); // Check if user is logged in
  const toast = useToast();
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
  const [isWinner, setIsWinner] = useState(false);
  const [isEditDescOpen, setIsEditDescOpen] = useState(false);
  const [descriptionHistory, setDescriptionHistory] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  // ✨ Real-time polling hooks
  const { auctionData, loading: auctionLoading } = useAuctionPolling(productId);
  const { bids, highestBid, bidCount } = useBidPolling(productId);
  const { timeRemaining, hasEnded } = useAuctionCountdown(
    auctionData?.end_time || product?.end_time,
    () => {
      console.log("Auction ended!");
      setIsEnded(true);
    }
  );

  // Fetch description history
  const fetchDescriptionHistory = async () => {
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
  };

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
  }, [productId]);

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
  }, [product?.id]);

  const openBidQuickView = () => {
    setShowBidQuickView(true);
  };
  const closeBidQuickView = () => setShowBidQuickView(false);
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
      toast.success("Product updated successfully!");
      // Reload product to reflect changes
      const updated = await productService.getProductById(productId);
      setProduct(updated);
    } catch (e) {
      toast.error("Failed to update product");
    }
  };

  const requireAuth = (actionCallback) => {
    if (!user) {
      // Navigate to signin using React Router
      const currentPath = encodeURIComponent(location.pathname);
      navigate(`/auth/signin?from=${currentPath}`);
      return;
    }
    actionCallback();
  };

  const handleUpdateDescription = async (productId, data) => {
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
    const activeBids = bids.filter(bid => bid.status !== 'rejected');
    
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
                <div
                  className="mt-2 text-sm font-medium"
                  style={{
                    color:
                      product.price_holder === user?.id ? "#16a34a" : "#2563eb",
                    backgroundColor:
                      product.price_holder === user?.id ? "#f0fdf4" : "#eff6ff",
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
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {sellerRating
                      ? `Rating: ${sellerRating}`
                      : "No ratings yet"}
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
                    📊 {bidCount} bid{bidCount !== 1 ? "s" : ""}
                  </p>
                )}
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
                        <span>✏️</span>
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
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                          color: COLORS.MIDNIGHT_ASH,
                          lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                        }}
                        dangerouslySetInnerHTML={{ __html: desc.content }}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    className="p-4 rounded-lg border border-gray-200 bg-white"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY_LARGE,
                      color: COLORS.MIDNIGHT_ASH,
                      lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                    }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}
              </div>
            </div>

            <form className="mt-6">
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
                          if (inWatchlist) {
                            const userId = user.id;
                            navigate(`/watchlists/${userId}`);
                            return;
                          }
                          watchlistService.addToWatchlist(product);
                          setInWatchlist(true);
                        });
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
