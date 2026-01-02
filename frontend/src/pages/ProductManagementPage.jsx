import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import Modal from "../components/Modal";
import EditProductModal from "../components/EditProductModal";
import { formatCurrency, formatTimeLeft } from "../utils/formatters";
import { productService } from "../services/productService";
import { useToast } from "../context/ToastContext";
import { categoryService } from "../services/categoryService";
import userService from "../services/userService";

const ProductManagementPage = () => {
  const location = useLocation();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Local filter states
  const [localSearch, setLocalSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  // sortBy possible values: end_time_desc | price_asc | price_desc | bid_asc | bid_desc
  const [sortBy, setSortBy] = useState("end_time_desc");
  const [filterBy, setFilterBy] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState("");
  const [sellerNames, setSellerNames] = useState({});
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [descriptionHistory, setDescriptionHistory] = useState([]);

  // Sync state to URL query params
  const updateUrl = (overrides = {}) => {
    const nextCategory =
      overrides.category_id !== undefined ? overrides.category_id : categoryId;
    const nextSearch =
      overrides.search !== undefined ? overrides.search : appliedSearch;
    const nextSort = overrides.sort !== undefined ? overrides.sort : sortBy;
    const nextFilter =
      overrides.filter !== undefined ? overrides.filter : filterBy;
    const nextPage =
      overrides.page !== undefined ? overrides.page : currentPage;
    const sp = new URLSearchParams();
    if (nextCategory) sp.set("category_id", nextCategory);
    if (nextSearch) sp.set("search", nextSearch);
    if (nextSort) sp.set("sort", nextSort);
    if (nextFilter && nextFilter !== "all") sp.set("status", nextFilter);
    if (nextPage && nextPage !== 1) sp.set("page", String(nextPage));
    navigate({ pathname: location.pathname, search: `?${sp.toString()}` });
  };

  const productsPerPage = 5;
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get("category_id") || null;

  // Fetch categories for sidebar and title mapping (mock fallback)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products (fetch all, paginate client-side)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build API params
        const params = {
          // request a large limit to retrieve all matching items
          limit: 1000,
        };

        if (categoryId) params.category_id = categoryId;
        if (appliedSearch) params.search = appliedSearch;

        // Sorting flags (backend handles actual ordering logic)
        switch (sortBy) {
          case "end_time_desc":
            params.end_time_desc = true;
            break;
          case "price_asc":
            params.price_asc = true;
            break;
          case "price_desc":
            params.price_desc = true;
            break;
          case "bid_asc":
            params.bid_amount_asc = true;
            break;
          case "bid_desc":
            params.bid_amount_desc = true;
            break;
          default:
            params.end_time_desc = true;
        }

        // Status filtering
        if (filterBy === "active") params.status = "active";
        else if (filterBy === "ended") params.status = "ended";

        // Call API
        const response = await productService.getProducts(params);
        const allItems = response.data || response.items || response || [];
        const items = Array.isArray(allItems) ? allItems : [];
        setProducts(items);
        setTotalPages(Math.ceil(items.length / productsPerPage) || 1);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching products list:", error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, appliedSearch, sortBy, filterBy, categories]);

  // Helper: get thumbnail URL
  const getThumbnail = (p) => {
    if (!p) return "/images/sample.jpg";
    return (
      p.thumbnail ||
      (Array.isArray(p.images)
        ? p.images.find((img) => img?.is_thumbnail)?.image_url ||
          p.images[0]?.image_url
        : null) ||
      "/images/sample.jpg"
    );
  };

  // Helper: sanitize basic HTML (strip script tags)
  const sanitizeHtml = (html) => {
    if (!html) return "";
    try {
      return String(html)
        .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis, "")
        .replace(/on[a-zA-Z]+\s*=\s*"[^"]*"/g, "");
    } catch (e) {
      return String(html);
    }
  };

  // Helper: category name
  const getCategoryName = (id) => {
    const c = categories.find((x) => x.id === id);
    return c ? c.name : "Unknown";
  };

  // Helper: collect all image URLs (thumbnail + images[])
  const getImageUrls = (p) => {
    if (!p) return [];
    const raw = Array.isArray(p.images) ? p.images : [];
    const urls = raw
      .map((img) => (typeof img === "string" ? img : img?.image_url))
      .filter(Boolean);
    if (p.thumbnail && !urls.includes(p.thumbnail)) urls.unshift(p.thumbnail);
    return urls;
  };

  // Format description date (DD/MM/YYYY)
  const formatDescriptionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Load seller full name for selected product
  useEffect(() => {
    const loadSeller = async () => {
      const sid = selectedProduct?.seller_id;
      if (!sid) {
        setSellerName("");
        return;
      }
      try {
        const u = await userService.getUserById(sid);
        setSellerName(u?.fullName || u?.full_name || u?.username || sid);
      } catch (e) {
        setSellerName(sid);
      }
    };
    loadSeller();
  }, [selectedProduct?.seller_id]);

  // Load full product details and description history when opening modal
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedProduct?.id) {
        setSelectedProductDetails(null);
        setDescriptionHistory([]);
        return;
      }
      try {
        const full = await productService.getProductById(selectedProduct.id);
        setSelectedProductDetails(full || selectedProduct);
      } catch (e) {
        setSelectedProductDetails(selectedProduct);
      }
      try {
        const history = await productService.getDescriptionHistory(
          selectedProduct.id
        );
        setDescriptionHistory(history || []);
      } catch (err) {
        // Fallback to current description
        if (selectedProduct?.description) {
          setDescriptionHistory([
            {
              id: "initial",
              content: selectedProduct.description,
              created_at:
                selectedProduct.created_at || new Date().toISOString(),
              type: "initial",
            },
          ]);
        } else {
          setDescriptionHistory([]);
        }
      }
    };
    loadDetails();
  }, [selectedProduct?.id]);

  // Handle Search Input Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setAppliedSearch(localSearch);
      setCurrentPage(1);
      updateUrl({ search: localSearch, page: 1 });
    }
  };

  // Handle Edit Product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  // Handle Update Product
  const handleUpdateProduct = async (productId, data) => {
    try {
      await productService.updateProduct(productId, data);

      // Refresh products list (fetch all)
      const params = { limit: 1000 };
      if (categoryId) params.category_id = categoryId;
      if (appliedSearch) params.search = appliedSearch;

      const response = await productService.getProducts(params);
      const allItems = response.data || response.items || response || [];
      const items = Array.isArray(allItems) ? allItems : [];
      setProducts(items);
      setTotalPages(Math.ceil(items.length / productsPerPage) || 1);

      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error; // Let modal handle the error
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productService.deleteProduct(productId);

      // Refresh products list (fetch all)
      const params = { limit: 1000 };
      if (categoryId) params.category_id = categoryId;
      if (appliedSearch) params.search = appliedSearch;

      const response = await productService.getProducts(params);
      const allItems = response.data || response.items || response || [];
      const items = Array.isArray(allItems) ? allItems : [];
      setProducts(items);
      setTotalPages(Math.ceil(items.length / productsPerPage) || 1);

      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    }
  };

  // Paginate products
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // Fetch seller full names for visible products (cache in map)
  useEffect(() => {
    const loadNames = async () => {
      try {
        const ids = Array.from(
          new Set(
            currentProducts
              .map((p) => p?.seller_id)
              .filter((id) => id && !sellerNames[id])
          )
        );
        if (ids.length === 0) return;
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const u = await userService.getUserById(id);
              return [
                id,
                u?.fullName || u?.full_name || u?.username || String(id),
              ];
            } catch (e) {
              return [id, String(id)];
            }
          })
        );
        const next = { ...sellerNames };
        results.forEach(([id, name]) => (next[id] = name));
        setSellerNames(next);
      } catch (e) {
        // ignore
      }
    };
    loadNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProducts]);

  // Responsive time-left similar to ProductCard
  const getTimeLeft = (endTime) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Product Management</h3>
      </div>

      {/* Top Controls */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onSearch={() => {
            setAppliedSearch(localSearch);
            setCurrentPage(1);
            updateUrl({ search: localSearch, page: 1 });
          }}
          placeholder="Search products..."
          onKeyDown={handleSearchKeyDown}
        />

        <div className="flex items-center justify-between">
          <div className="text- text-gray-600">
            Results for{" "}
            {appliedSearch ? (
              <span className="font-semibold text-gray-900">
                "{appliedSearch}"
              </span>
            ) : (
              <span className="font-semibold text-gray-900">All</span>
            )}
          </div>
          <div className="flex gap-3">
            <FilterDropdown
              label="Sorting"
              value={
                sortBy === "end_time_desc"
                  ? "End Time ↓"
                  : sortBy === "price_asc"
                  ? "Start Price ↑"
                  : sortBy === "price_desc"
                  ? "Start Price ↓"
                  : sortBy === "bid_asc"
                  ? "Current Bid ↑"
                  : "Current Bid ↓"
              }
              options={[
                { label: "End Time Desc", value: "end_time_desc" },
                { label: "Start Price ↑", value: "price_asc" },
                { label: "Start Price ↓", value: "price_desc" },
                { label: "Current Bid ↑", value: "bid_asc" },
                { label: "Current Bid ↓", value: "bid_desc" },
              ]}
              isOpen={showSortMenu}
              onToggle={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              onSelect={(value) => {
                setSortBy(value);
                setShowSortMenu(false);
                setCurrentPage(1);
                updateUrl({ sort: value, page: 1 });
              }}
            />

            <FilterDropdown
              label="Filter"
              value={
                filterBy === "all"
                  ? "All"
                  : filterBy === "active"
                  ? "Active"
                  : "Ended"
              }
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Ended", value: "ended" },
              ]}
              isOpen={showFilterMenu}
              onToggle={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              onSelect={(value) => {
                setFilterBy(value);
                setShowFilterMenu(false);
                setCurrentPage(1);
                updateUrl({ filter: value, page: 1 });
              }}
            />
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10  mb-4"></div>
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        ) : currentProducts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {currentProducts.map((product) => (
              <div key={product.id} className="flex gap-4 p-4 hover:bg-gray-50">
                {/* Image */}
                <div className="w-36 h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={getThumbnail(product)}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                          Current
                        </span>
                        <span className="text-lg font-bold text-pebble">
                          {Number(
                            product.current_price || product.start_price || 0
                          ).toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                          Seller
                        </span>
                        <span className="text-gray-700 font-medium">
                          {sellerNames[product.seller_id] ||
                            product.seller_id ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                          Time left
                        </span>
                        <span className="text-gray-700 font-medium">
                          {getTimeLeft(product.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end justify-center gap-2.5 min-w-[110px]">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full !px-4 !py-2 btn-primary !rounded-lg !text-sm font-semibold hover:!bg-gray-700 transition-all"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="w-full !px-4 !py-2 btn-secondary !rounded-lg !text-sm font-semibold hover:!bg-gray-200 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-full !px-4 !py-2 bg-red-100 text-red-700 !border !border-red-200 text-sm rounded-lg hover:!bg-red-200 font-medium transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-16">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-500 text-base font-medium mb-1">
              No products found
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p);
              updateUrl({ page: p });
            }}
          />
        </div>
      )}

      {/* Product Details Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Details"
        size="xl"
      >
        {selectedProduct && (
          <div className="relative p-4">
            {/* Product Images */}
            <div className="mb-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {getImageUrls(selectedProductDetails || selectedProduct)
                  .length > 0 ? (
                  getImageUrls(selectedProductDetails || selectedProduct).map(
                    (url, idx) => (
                      <div
                        key={idx}
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={url}
                          alt={`${selectedProduct.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  )
                ) : (
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src="/images/sample.jpg"
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Product
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedProduct.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.status === "active"
                          ? "bg-green-100 text-green-700"
                          : selectedProduct.status === "ended"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedProduct.status
                        ? selectedProduct.status.charAt(0).toUpperCase() +
                          selectedProduct.status.slice(1)
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-left gap-2">
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                </div>
                <div className="space-y-3 mt-2">
                  {descriptionHistory.length > 0 ? (
                    descriptionHistory.map((desc) => (
                      <div
                        key={desc.id}
                        className="p-3 rounded-lg border border-gray-200 bg-white"
                      >
                        <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
                          <span>✏️</span>
                          <span className="font-semibold">
                            {formatDescriptionDate(desc.created_at)}
                          </span>
                          {desc.type === "initial" && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              Initial
                            </span>
                          )}
                        </div>
                        <div
                          className="text-gray-900 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(desc.content),
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      className="p-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          selectedProduct.description ||
                            "No description available"
                        ),
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Price
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {formatCurrency(selectedProduct.start_price)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Current Price
                  </label>
                  <p className="text-pebble font-bold text-lg mt-1">
                    {formatCurrency(
                      selectedProduct.current_price ||
                        selectedProduct.start_price
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Buy Now Price
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedProduct.buy_now_price
                      ? formatCurrency(selectedProduct.buy_now_price)
                      : "Not available"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Step Price
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {formatCurrency(selectedProduct.step_price)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Time
                  </label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedProduct.start_time).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    End Time
                  </label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedProduct.end_time).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Time Left
                  </label>
                  <p className="text-gray-900 font-medium mt-1">
                    {getTimeLeft(selectedProduct.end_time)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Bids
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedProduct.bid_count || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Seller
                  </label>
                  <p className="text-gray-900 text-sm mt-1">
                    {sellerName || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="text-gray-900 text-sm mt-1">
                    {getCategoryName(selectedProduct.category_id)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Allow Unrated Bidder
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.allow_unrated_bidder
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedProduct.allow_unrated_bidder ? "Yes" : "No"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Auto Extend
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.auto_extend
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedProduct.auto_extend ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              </div>

              {selectedProduct.price_holder_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Highest Bidder
                  </label>
                  <p className="text-gray-900 text-sm mt-1">
                    {selectedProduct.price_holder_name}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <p className="text-gray-900 text-sm mt-1">
                    {new Date(selectedProduct.created_at).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Updated At
                  </label>
                  <p className="text-gray-900 text-sm mt-1">
                    {new Date(selectedProduct.updated_at).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              {/* Close button */}
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close"
                className="top-2 right-2 p-2 px-4 rounded-lg hover:bg-gray-100 !border transition-all"
              >
                Cancel
              </button>
              <button className="px-6 py-2 !bg-red-600 text-white rounded-lg font-medium !hover:bg-red-700 transition-colors">
                Remove Product
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductManagementPage;
