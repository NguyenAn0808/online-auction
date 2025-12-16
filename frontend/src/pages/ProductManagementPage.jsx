import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import Modal from "../components/Modal";
import EditProductModal from "../components/EditProductModal";
import { formatCurrency, formatTimeLeft } from "../utils/formatters";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";

const ProductManagementPage = () => {
  const location = useLocation();
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

  // Fetch products (API call with mock fallback)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build API params
        const params = {
          page: currentPage,
          limit: productsPerPage,
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
        const items = response.data || response.items || response;
        setProducts(Array.isArray(items) ? items : []);

        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          setTotalPages(
            response.totalPages ||
              response.total_pages ||
              Math.ceil((items?.length || 0) / productsPerPage) ||
              1
          );
        }
      } catch (error) {
        console.error("Error fetching products list:", error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, appliedSearch, sortBy, filterBy, currentPage, categories]);

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

      // Refresh products list
      const params = {
        page: currentPage,
        limit: productsPerPage,
      };
      if (categoryId) params.category_id = categoryId;
      if (appliedSearch) params.search = appliedSearch;

      const response = await productService.getProducts(params);
      const items = response.data || response.items || response;
      setProducts(Array.isArray(items) ? items : []);

      alert("Product updated successfully!");
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

      // Refresh products list
      const params = {
        page: currentPage,
        limit: productsPerPage,
      };
      if (categoryId) params.category_id = categoryId;
      if (appliedSearch) params.search = appliedSearch;

      const response = await productService.getProducts(params);
      const items = response.data || response.items || response;
      setProducts(Array.isArray(items) ? items : []);

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(
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
                    src={
                      product.images && product.images[0]
                        ? product.images[0]
                        : "/images/sample.jpg"
                    }
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
                          {formatCurrency(
                            product.current_price || product.start_price
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                          Seller
                        </span>
                        <span className="text-gray-700 font-medium">
                          ****{product.seller_id ? "Khoa" : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20">
                          Time left
                        </span>
                        <span className="text-gray-700 font-medium">
                          {formatTimeLeft(product.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end justify-center gap-2.5 min-w-[110px]">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full px-4 py-2 bg-morning-mist text-midnight-ash rounded-lg text-sm font-semibold hover:!bg-gray-300 transition-all"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="w-full px-4 py-2 bg-whisper text-pebble rounded-lg text-sm font-semibold hover:bg-soft-cloud transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-full px-4 py-2 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
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
          <div>
            {/* Product Image */}
            <div className="mb-6">
              <img
                src={
                  selectedProduct.images && selectedProduct.images[0]
                    ? selectedProduct.images[0]
                    : "/images/sample.jpg"
                }
                alt={selectedProduct.name}
                className="w-full max-h-80 object-cover rounded-lg"
              />
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Product ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {selectedProduct.id}
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
                <label className="text-sm font-medium text-gray-500">
                  Product Name
                </label>
                <p className="text-gray-900 font-semibold mt-1">
                  {selectedProduct.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedProduct.description || "No description available"}
                </p>
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
                    {formatTimeLeft(selectedProduct.end_time)}
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
                    Seller ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {selectedProduct.seller_id || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Category ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {selectedProduct.category_id || "N/A"}
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

              {selectedProduct.highest_bidder_id && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Highest Bidder ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm mt-1">
                    {selectedProduct.highest_bidder_id}
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
