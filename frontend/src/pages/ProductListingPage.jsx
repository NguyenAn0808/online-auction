import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategorySidebar from "../components/CategorySidebar";
import SortBar from "../components/SortBar";
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

  // Fetch products from backend API (fetch all, paginate client-side)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params from URL search params
        const params = {
          // fetch a large batch to approximate "all"
          limit: 1000,
        };

        if (categoryId) params.category_id = categoryId;
        if (searchTerm) params.search = searchTerm;

        // Map frontend sort params to backend sort values
        if (sortPriceAsc) params.sort = "price_asc";
        else if (sortPriceDesc) params.sort = "price_desc";
        else if (sortEndTimeDesc) params.sort = "end_time_desc";
        else params.sort = "newest";

        // Note: Backend doesn't support price range filtering yet
        // These params are ignored for now
        // if (priceType === "start") {
        //   if (minStartPrice) params.min_start_price = minStartPrice;
        //   if (maxStartPrice) params.max_start_price = maxStartPrice;
        // }

        const response = await productService.getProducts(params);
        const allItems = response.items || response.data || response || [];
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
  }, [categoryId, searchTerm, sortPriceAsc, sortPriceDesc, sortEndTimeDesc]);

  // Get category name for display
  const getCategoryName = () => {
    return activeCategory ? activeCategory.name : "";
  };

  // Client-side pagination
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

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
            {/* Sort Bar */}
            <SortBar categoryName={getCategoryName()} />

            {/* Products List */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[40vh]">
                <div className="text-lg text-gray-600">Loading products...</div>
              </div>
            ) : currentProducts.length > 0 ? (
              <div className="space-y-4">
                {currentProducts.map((product) => {
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
