import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import SimpleProductList from "../components/SimpleProductList";
import { productService } from "../services/productService";

const ProductListingPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get("category_id");
  const searchTerm = searchParams.get("search");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (categoryId) params.category_id = categoryId;
        if (searchTerm) params.search = searchTerm;
        const data = await productService.getProducts(params);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, searchTerm]);

  const title = categoryId
    ? `Products in category` // Could map id -> name if categories cached
    : searchTerm
    ? `Search results for "${searchTerm}"`
    : "All Products";

  return (
    <>
      <Header />
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : (
        <SimpleProductList title={title} products={products} />
      )}
    </>
  );
};

export default ProductListingPage;
