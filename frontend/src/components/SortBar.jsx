import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SortBar = ({ categoryName = "" }) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
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
      if (
        showFilterMenu &&
        filterRef.current &&
        !filterRef.current.contains(e.target)
      ) {
        setShowFilterMenu(false);
      }
    };
    if (showSortMenu || showFilterMenu) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [showSortMenu, showFilterMenu]);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("category_id");

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
              setShowFilterMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7H21M6 12H18M9 17H15"
                stroke="#191919"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-medium">Sort by</span>
          </button>
          {showSortMenu && (
            <div
              ref={sortRef}
              className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y"
            >
              <SortOption label="Price: Low → High" param="price_asc" />
              <SortOption label="Price: High → Low" param="price_desc" />
              <SortOption label="End Time (Desc)" param="end_time_desc" />
              <SortOption
                label="Bid Amount: High → Low"
                param="bid_amount_desc"
              />
              <SortOption
                label="Bid Amount: Low → High"
                param="bid_amount_asc"
              />
              <ClearSortOption />
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu((v) => !v);
              setShowSortMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6H20M7 12H17M10 18H14"
                stroke="#191919"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-medium">Filter by</span>
          </button>
          {showFilterMenu && (
            <div
              ref={filterRef}
              className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
            >
              <h4 className="font-semibold mb-3">Price Range</h4>
              <div className="space-y-2 mb-4">
                <input
                  type="number"
                  placeholder="Min price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <h4 className="font-semibold mb-2">Status</h4>
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>Active auctions</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>Buy Now available</span>
                </label>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortBar;

// ----- Helpers -----
const SortOption = ({ label, param }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // Detect active state
  const isActive = params.has(param);

  const applySort = () => {
    // Clear other sort params
    [
      "price_asc",
      "price_desc",
      "end_time_desc",
      "bid_amount_asc",
      "bid_amount_desc",
    ].forEach((p) => params.delete(p));
    params.set(param, "1"); // value placeholder
    navigate(`/products?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={applySort}
      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
        isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
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
      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
        anyActive
          ? "hover:bg-red-50 text-red-600"
          : "text-gray-400 cursor-default"
      }`}
      disabled={!anyActive}
    >
      Clear Sort
    </button>
  );
};
