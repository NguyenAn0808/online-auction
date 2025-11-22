import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    // TODO: Implement API call to POST /watchlist
    setIsWatchlist(!isWatchlist);
  };

  return (
    <div
      className="relative bg-white w-full max-w-[192px] border border-black rounded-[20px] overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-300">
        <img
          src={thumbnail}
          alt={productName || "Product"}
          className="w-full h-full object-cover"
        />

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistClick}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-[38px] sm:h-[38px] bg-white rounded-full border-none cursor-pointer flex items-center justify-center p-0 hover:bg-gray-100 transition-colors"
          aria-label="Add to watchlists"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="sm:w-6 sm:h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 2C3.15265 2 1 5.07874 1 8.21053C1 10.4032 2.2622 12.083 3.27074 13.1579L11.2707 21.6842C11.4598 21.8857 11.7237 22 12 22C12.2763 22 12.5402 21.8857 12.7293 21.6842L20.7293 13.1579C21.7378 12.083 23 10.4032 23 8.21053C23 5.07874 20.8473 2 17 2C16.1223 2 15.2016 2.14991 14.2134 2.68203C13.4883 3.07246 12.7609 3.65031 12 4.46722C11.2391 3.65031 10.5117 3.07246 9.7866 2.68203C8.79839 2.14991 7.87768 2 7 2Z"
              fill={isWatchlist ? "#191919" : "none"}
              stroke={isWatchlist ? "none" : "#191919"}
              strokeWidth={isWatchlist ? "0" : "2"}
            />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 h-full">
        {/* Product Name */}
        <div className="font-normal text-sm sm:text-[16px] leading-5 sm:leading-[24px] text-black overflow-hidden line-clamp-3 h-[60px] sm:h-[72px]">
          {productName || "Product name"}
        </div>

        {/* Product Price */}
        <div className="font-extrabold leading-[19px] text-black">
          {displayPrice > 0
            ? `${displayPrice.toLocaleString("vi-VN")} VND`
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default SimpleProductCard;
