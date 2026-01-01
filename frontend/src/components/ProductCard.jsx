import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BiddingQuickView from "./BiddingQuickView";
import watchlistService from "../services/watchlistService";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product, onWatchlistChange }) => {
  const { user } = useAuth();
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [showBidQuickView, setShowBidQuickView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const productId = product?.id;
  const productName = product?.name;
  const currentPrice = product?.current_price || product?.start_price || 0;
  const buyNowPrice = product?.buy_now_price || 0;
  const bidCount = product?.bid_count || 0;
  const highestBidder = product?.highest_bidder_id || "N/A";
  const postedDate = product?.posted_date || product?.start_time;
  const endTime = product?.end_time;

  const thumbnail =
    product?.thumbnail ||
    product?.images?.find((img) => img.is_thumbnail)?.image_url ||
    product?.images?.[0]?.image_url ||
    "/images/sample.jpg";

  useEffect(() => {
    if (productId) {
      // First check cache for immediate UI response
      setIsWatchlist(watchlistService.isInWatchlist(productId));

      // Then verify with backend if user is logged in
      if (user?.id) {
        watchlistService
          .checkIsInWatchlist(user.id, productId)
          .then((inWatchlist) => {
            setIsWatchlist(inWatchlist);
          });
      }
    }
  }, [productId, user?.id]);

  const requireAuth = (actionCallback) => {
    if (!user) {
      // Redirect to login, saving current page to return to
      navigate("/auth/signin", { state: { from: location } });
      return;
    }
    actionCallback();
  };

  // Calculate time left
  const getTimeLeft = () => {
    if (!endTime) return "N/A";
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handlePlaceBid = (e) => {
    e.stopPropagation();
    // Wrap with auth check
    requireAuth(() => {
      setShowBidQuickView(true);
    });
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    // Wrap with auth check
    requireAuth(() => {
      navigate(`/transactions`);
      console.log("Buy now:", productId);
    });
  };

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();

    requireAuth(async () => {
      try {
        if (isWatchlist) {
          await watchlistService.removeFromWatchlist(user.id, productId);
          onWatchlistChange?.(productId, false);
        } else {
          await watchlistService.addToWatchlist(user.id, productId);
          onWatchlistChange?.(productId, true);
        }
        setIsWatchlist(!isWatchlist);
      } catch (error) {
        console.error("Watchlist error:", error);
      }
    });
  };

  return (
    <div
      className="product-card flex gap-4 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <img
          src={thumbnail}
          alt={productName || "Product"}
          className="product-image"
        />
        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistClick}
          className={`btn-watchlist ${isWatchlist ? "active" : ""}`}
          aria-label="Add to watchlist"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 2C3.15265 2 1 5.07874 1 8.21053C1 10.4032 2.2622 12.083 3.27074 13.1579L11.2707 21.6842C11.4598 21.8857 11.7237 22 12 22C12.2763 22 12.5402 21.8857 12.7293 21.6842L20.7293 13.1579C21.7378 12.083 23 10.4032 23 8.21053C23 5.07874 20.8473 2 17 2C16.1223 2 15.2016 2.14991 14.2134 2.68203C13.4883 3.07246 12.7609 3.65031 12 4.46722C11.2391 3.65031 10.5117 3.07246 9.7866 2.68203C8.79839 2.14991 7.87768 2 7 2Z" />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="text-product-title text-midnight font-semibold mb-2 line-clamp-2">
          {productName || "Product name"}
        </h3>

        {/* Bid Info */}
        <div className="mb-3">
          <div className="mb-2">
            <span className="text-sm text-pebble">Max bid: </span>
            <span className="text-base font-bold text-midnight">
              {currentPrice > 0
                ? `${currentPrice.toLocaleString("vi-VN")} VND`
                : "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm text-pebble">Highest bid: </span>
              <span className="text-base font-medium text-midnight">
                {highestBidder}
              </span>
            </div>
            <div>
              <span className="text-sm text-pebble">Bids: </span>
              <span className="text-base font-semibold text-midnight">
                {bidCount}
              </span>
            </div>
            <div>
              <span className="text-sm text-pebble">Posted: </span>
              <span className="text-sm font-medium text-midnight">
                {formatDate(postedDate)} at {formatTime(postedDate)}
              </span>
            </div>
            <div>
              <span className="text-sm text-pebble">Time left: </span>
              <span className="text-base font-semibold text-midnight">
                {getTimeLeft()}
              </span>
            </div>
          </div>
        </div>

        {/* Buy Now Price */}
        {buyNowPrice > 0 && (
          <div className="mb-3">
            <span className="text-sm text-pebble">Price: </span>
            <span className="text-lg font-bold text-midnight">
              {buyNowPrice.toLocaleString("vi-VN")} VND
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={handlePlaceBid}
            className="btn-primary flex-1 text-center"
          >
            Place bid
          </button>
          {buyNowPrice > 0 && (
            <button
              onClick={handleBuyNow}
              className="btn-outline hover:!bg-gray-200 flex-1 text-center"
            >
              Buy now
            </button>
          )}
        </div>
      </div>

      {/* Bid quick view modal */}
      <BiddingQuickView
        open={showBidQuickView}
        onClose={() => setShowBidQuickView(false)}
        product={product}
      />
    </div>
  );
};

export default ProductCard;
