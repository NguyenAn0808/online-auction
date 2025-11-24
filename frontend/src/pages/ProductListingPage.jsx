import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import CategorySidebar from "../components/CategorySidebar";
import SortBar from "../components/SortBar";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import productsWithBidsMock from "../data/productsWithBids.json";
import categoriesMock from "../data/categories.json";

const ProductListingPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const useMock = true; // toggle mock usage
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

  // Fetch categories for sidebar and title mapping (mock fallback)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (useMock) {
          setCategories(categoriesMock);
          return;
        }
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(useMock ? categoriesMock : []);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products (API or mock with local filtering/sorting)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (useMock) {
          let list = [...productsWithBidsMock];

          // Category (parent expands children)
          if (categoryId) {
            const cat = categories.find((c) => (c.id || c._id) === categoryId);
            if (cat && !cat.parent_id) {
              const childIds = categories
                .filter((c) => c.parent_id === categoryId)
                .map((c) => c.id || c._id);
              if (childIds.length > 0) {
                list = list.filter((p) => childIds.includes(p.category_id));
              } else {
                list = list.filter((p) => p.category_id === categoryId);
              }
            } else {
              list = list.filter((p) => p.category_id === categoryId);
            }
          }

          // Search
          if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(lower));
          }

          // Price filter
          if (priceType === "start") {
            if (minStartPrice)
              list = list.filter((p) => p.start_price >= Number(minStartPrice));
            if (maxStartPrice)
              list = list.filter((p) => p.start_price <= Number(maxStartPrice));
          } else if (priceType === "current") {
            if (minCurrentPrice)
              list = list.filter(
                (p) => p.current_price >= Number(minCurrentPrice)
              );
            if (maxCurrentPrice)
              list = list.filter(
                (p) => p.current_price <= Number(maxCurrentPrice)
              );
          }

          // Sort
          if (sortPriceAsc) list.sort((a, b) => a.start_price - b.start_price);
          else if (sortPriceDesc)
            list.sort((a, b) => b.start_price - a.start_price);
          else if (sortBidAsc)
            list.sort((a, b) => a.current_price - b.current_price);
          else if (sortBidDesc)
            list.sort((a, b) => b.current_price - a.current_price);
          else if (sortEndTimeDesc)
            list.sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

          setProducts(list);
          setTotalPages(Math.ceil(list.length / 5) || 1);
        } else {
          const params = {};
          if (categoryId) params.category_id = categoryId;
          if (searchTerm) params.search = searchTerm;
          if (priceType === "start") {
            if (minStartPrice) params.min_start_price = minStartPrice;
            if (maxStartPrice) params.max_start_price = maxStartPrice;
          } else if (priceType === "current") {
            if (minCurrentPrice) params.min_current_price = minCurrentPrice;
            if (maxCurrentPrice) params.max_current_price = maxCurrentPrice;
          }
          if (sortPriceAsc) params.price_asc = 1;
          if (sortPriceDesc) params.price_desc = 1;
          if (sortEndTimeDesc) params.end_time_desc = 1;
          if (sortBidAsc) params.bid_amount_asc = 1;
          if (sortBidDesc) params.bid_amount_desc = 1;

          const data = await productService.getProducts(params);
          const items = data.items || data;
          setProducts(Array.isArray(items) ? items : []);
          setTotalPages(
            data.totalPages ||
              data.total_pages ||
              Math.ceil((items?.length || 0) / 5) ||
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
    setCurrentPage(1); // reset pagination when filters change
  }, [
    categoryId,
    searchTerm,
    priceType,
    minStartPrice,
    maxStartPrice,
    minCurrentPrice,
    maxCurrentPrice,
    sortPriceAsc,
    sortPriceDesc,
    sortEndTimeDesc,
    sortBidAsc,
    sortBidDesc,
    categories,
    useMock,
  ]);

  // Get category name for display
  const getCategoryName = () => {
    return activeCategory ? activeCategory.name : "";
  };

  // Paginate products
  const productsPerPage = 5;
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
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
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
