import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import watchlistService from "../services/watchlistService";
import { useAuth } from "../context/AuthContext";

const SimpleProductCard = ({ product }) => {
  const { user } = useAuth();
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from database schema
  const productId = product?.id;
  const productName = product?.name;

  // Price: use current_price if available, fallback to start_price
  const displayPrice = product?.current_price || product?.start_price || 0;

  // Image: get thumbnail from product_images (is_thumbnail = true) or first image
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

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();

    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      if (isWatchlist) {
        await watchlistService.removeFromWatchlist(user.id, productId);
      } else {
        await watchlistService.addToWatchlist(user.id, productId);
      }
      setIsWatchlist(!isWatchlist);
    } catch (error) {
      console.error("Watchlist error:", error);
    }
  };

  const handleLoginFromDialog = () => {
    setShowLoginDialog(false);
    navigate("/auth/signin", { state: { from: location } });
  };
  return (
    <>
      <div
        className="product-card !p-0"
        style={{ maxWidth: "192px", cursor: "pointer" }}
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
        <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 h-full">
          {/* Product Name */}
          <div className="product-name overflow-hidden line-clamp-3 h-[60px] sm:h-[72px]">
            {productName || "Product name"}
          </div>

          {/* Product Price */}
          <div className="product-price">
            {displayPrice > 0
              ? `${displayPrice.toLocaleString("vi-VN")} VND`
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to add products to your watchlist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginFromDialog}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleProductCard;
