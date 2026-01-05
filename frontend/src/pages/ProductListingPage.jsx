import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategorySidebar from "../components/CategorySidebar";
import FilterDropdown from "../components/FilterDropdown";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as FunnelSolid } from "@heroicons/react/24/solid";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";

const ProductListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const productsPerPage = 5;

  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search") || null;
  const categoryId = searchParams.get("category_id") || null;
  const priceType = searchParams.get("price_type");
  const minStartPrice = searchParams.get("min_start_price");
  const maxStartPrice = searchParams.get("max_start_price");
  const minCurrentPrice = searchParams.get("min_current_price");
  const maxCurrentPrice = searchParams.get("max_current_price");
  const sortPriceAsc = searchParams.has("price_asc");
  const sortPriceDesc = searchParams.has("price_desc");
  const sortEndTimeDesc = searchParams.has("end_time_desc");
  const sortBidAsc = searchParams.has("bid_amount_asc");
  const sortBidDesc = searchParams.has("bid_amount_desc");

  // Find category by id for display name
  const activeCategory = categories.find(
    (cat) => (cat.id || cat._id) === categoryId
  );

  // Fetch categories for sidebar and title mapping
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Reset to first page when filters/sorts change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, searchTerm, sortPriceAsc, sortPriceDesc, sortEndTimeDesc]);

  // Fetch products from backend API using server-side pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params from URL search params
        const params = {
          // use server-side pagination
          page: currentPage,
          limit: productsPerPage,
        };

        if (categoryId) params.category_id = categoryId;
        if (searchTerm) params.search = searchTerm;

        // Map frontend sort params to backend sort values
        if (sortPriceAsc) params.sort = "price_asc";
        else if (sortPriceDesc) params.sort = "price_desc";
        else if (sortEndTimeDesc) params.sort = "end_time_desc";
        else params.sort = "newest";

        const response = await productService.getProducts(params);
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        setProducts(items);
        // Backend returns pagination { page, limit, total } — compute totalPages
        const pagination = response?.pagination || response?.data?.pagination;
        const totalItems = pagination?.total;
        const limitVal = pagination?.limit || productsPerPage;
        setTotalPages(
          totalItems && limitVal ? Math.ceil(totalItems / limitVal) : 1
        );
      } catch (error) {
        console.error("Error fetching products list:", error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    categoryId,
    searchTerm,
    sortPriceAsc,
    sortPriceDesc,
    sortEndTimeDesc,
    location.search,
    currentPage,
  ]);

  // Get category name for display
  const getCategoryName = () => {
    return activeCategory ? activeCategory.name : "";
  };

  const getResultsText = () => {
    if (searchTerm) return `Results for "${searchTerm}"`;
    const cn = getCategoryName();
    if (cn) return `Results for ${cn}`;
    if (categoryId) return "Results for category";
    return "All products";
  };

  const getActiveSortLabel = () => {
    if (sortPriceAsc) return "Price: Low → High";
    if (sortPriceDesc) return "Price: High → Low";
    if (sortEndTimeDesc) return "End Time";
    return "Sort";
  };

  const handleSelectSort = (val) => {
    const params = new URLSearchParams(location.search);
    [
      "price_asc",
      "price_desc",
      "end_time_desc",
      "bid_amount_asc",
      "bid_amount_desc",
    ].forEach((p) => params.delete(p));

    if (val === "price_asc") params.set("price_asc", "1");
    else if (val === "price_desc") params.set("price_desc", "1");
    else if (val === "end_time_desc") params.set("end_time_desc", "1");
    // val === 'clear' means no sort params

    // Reset page to 1 when sorting changes
    params.delete("page");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  return (
    <div className="min-h-screen bg-whisper">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="flex-shrink-0">
            <CategorySidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Controls - FilterDropdown for sorting */}
            <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getResultsText()}
                </h2>
              </div>
              <div className="flex gap-2">
                <FilterDropdown
                  label="Sort"
                  value={getActiveSortLabel()}
                  options={[
                    { label: "Price: Low → High", value: "price_asc" },
                    { label: "Price: High → Low", value: "price_desc" },
                    { label: "End Time", value: "end_time_desc" },
                    { label: "Clear", value: "clear" },
                  ]}
                  isOpen={showSortMenu}
                  onToggle={() => setShowSortMenu(!showSortMenu)}
                  onSelect={(value) => {
                    handleSelectSort(value);
                    setShowSortMenu(false);
                  }}
                  Icon={FunnelIcon}
                  ActiveIcon={FunnelSolid}
                />
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[40vh]">
                <div className="text-lg text-gray-600">Loading products...</div>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => {
                  const handleClick = () => {
                    navigate(`/products/${product.id}`);
                  };

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleClick}
                      onPlaceBid={() => navigate(`/bids/${product.id}`)}
                      onBuyNow={() => navigate(`/orders/${product.id}`)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center min-h-[40vh]">
                <div className="text-lg text-gray-600">No products found</div>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
