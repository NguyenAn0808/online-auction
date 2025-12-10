import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import watchlistService from "../services/watchlistService";

const SimpleProductCard = ({ product }) => {
  const [isWatchlist, setIsWatchlist] = useState(false);
  const navigate = useNavigate();

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
      setIsWatchlist(watchlistService.isInWatchlist(productId));
    }
  }, [productId]);

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (isWatchlist) {
      watchlistService.removeFromWatchlist(productId);
    } else {
      watchlistService.addToWatchlist({
        id: productId,
        name: productName,
        images: product?.images || [],
        price: displayPrice,
      });
    }
    setIsWatchlist(!isWatchlist);
  };
  return (
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
  );
};

export default SimpleProductCard;
