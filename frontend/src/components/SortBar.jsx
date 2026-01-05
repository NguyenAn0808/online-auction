import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FunnelIcon as FunnelOutline } from "@heroicons/react/24/outline";
import { FunnelIcon as FunnelSolid } from "@heroicons/react/24/solid";

const SortBar = ({ categoryName = "" }) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Outside click close
  useEffect(() => {
    const handler = (e) => {
      if (
        showSortMenu &&
        sortRef.current &&
        !sortRef.current.contains(e.target)
      ) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [showSortMenu]);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("category_id");

  const activeSortParams = [
    "price_asc",
    "price_desc",
    "end_time_desc",
    "bid_amount_asc",
    "bid_amount_desc",
  ];
  const anySortActive = activeSortParams.some((p) => searchParams.has(p));

  const getActiveSortLabel = () => {
    if (searchParams.has("price_asc")) return "Price: Low → High";
    if (searchParams.has("price_desc")) return "Price: High → Low";
    if (searchParams.has("end_time_desc")) return "End Time";
    if (searchParams.has("bid_amount_asc")) return "Bid Amount: Low → High";
    if (searchParams.has("bid_amount_desc")) return "Bid Amount: High → Low";
    return "Sort by";
  };
  const activeSortLabel = getActiveSortLabel();

  const getResultsText = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (categoryName) return `Results for ${categoryName}`;
    if (categoryId) return "Results for category";
    return "All products";
  };

  return (
    <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900">
          {getResultsText()}
        </h2>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setShowSortMenu((v) => !v);
            }}
            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors ${
              anySortActive
                ? "border-blue-500 bg-whisper"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {anySortActive ? (
              <FunnelSolid className="w-5 h-5 text-pebble" />
            ) : (
              <FunnelOutline className="w-5 h-5 text-midnight-ash" />
            )}
            <span
              className={`font-medium ${anySortActive ? "text-pebble" : ""}`}
            >
              {anySortActive ? activeSortLabel : "Sort by"}
            </span>
          </button>

          {showSortMenu && (
            <div
              ref={sortRef}
              className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y"
            >
              <SortOption label="Price: Low → High" param="price_asc" />
              <SortOption label="Price: High → Low" param="price_desc" />
              <SortOption label="End Time" param="end_time_desc" />
              <ClearSortOption />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortBar;

// ===== HELPERS =====
const SortOption = ({ label, param }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const isActive = params.has(param);

  const applySort = () => {
    [
      "price_asc",
      "price_desc",
      "end_time_desc",
      "bid_amount_asc",
      "bid_amount_desc",
    ].forEach((p) => params.delete(p));

    params.set(param, "1");
    navigate(`/products?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={applySort}
      className={`w-full text-left px-4 py-3 text-sm font-medium  text-midnight-ash hover:text-pebble transition-colors ${
        isActive ? "bg-whisper" : "hover:bg-whisper"
      }`}
    >
      {label}
    </button>
  );
};

const ClearSortOption = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const anyActive = [
    "price_asc",
    "price_desc",
    "end_time_desc",
    "bid_amount_asc",
    "bid_amount_desc",
  ].some((p) => params.has(p));

  const clear = () => {
    [
      "price_asc",
      "price_desc",
      "end_time_desc",
      "bid_amount_asc",
      "bid_amount_desc",
    ].forEach((p) => params.delete(p));

    navigate(`/products?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={clear}
      disabled={!anyActive}
      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
        anyActive
          ? "hover:bg-gray-50 text-red-600"
          : "text-gray-400 cursor-default"
      }`}
    >
      Clear Sort
    </button>
  );
};
