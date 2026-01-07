import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import SimpleProductList from "../components/SimpleProductList";
import Footer from "../components/Footer";
import ProductOverview from "../components/ProductOverview";
import ProductFeatures from "../components/ProductFeatures";
import SimiliarProductsList from "../components/SimiliarProductsList";
import SellerFeedback from "../components/SellerFeedback";
import BidHistory from "../components/BidHistory";
import QuestionsHistory from "../components/QuestionsHistory";
import { COLORS, SPACING } from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useParams, useLocation } from "react-router-dom";
import { productService } from "../services/productService";

const ProductDetails = () => {
  const { user } = useAuth();
  const { productId } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product data to get category_id for similar products
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    document.title = "Product Details — eBid";
  }, [productId, location.pathname]);

  return (
    <>
      <Header />
      <div style={{ backgroundColor: COLORS.WHISPER }} key={productId}>
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "1400px",
            paddingLeft: SPACING.M,
            paddingRight: SPACING.M,
          }}
        >
          {/* Product Overview Section */}
          <div>
            <ProductOverview productId={productId} />
          </div>

          {/* Product Features Section */}
          {/* <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <ProductFeatures product={product} />
          </div> */}

          {/* Similar Products Section */}
          <div className="b mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <SimiliarProductsList
              categoryId={product?.category_id}
              currentProductId={productId}
            />
          </div>

          {/* Seller Feedback Section
          <div
            style={{
              paddingTop: SPACING.XXL,
              paddingBottom: SPACING.XXL,
              borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
            }}
          >
            <SellerFeedback />
          </div> */}

          {/* Bid History Section - Visible to everyone, seller controls only for logged-in sellers */}
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <BidHistory
              productId={productId}
              isSeller={user && product && user.id === product.seller_id}
            />
          </div>

          {/* Questions History Section - Visible to everyone, posting questions requires auth */}
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <QuestionsHistory productId={productId} product={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
