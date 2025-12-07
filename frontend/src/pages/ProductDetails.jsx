import React from "react";
import Header from "../components/Header";
import SimpleProductList from "../components/SimpleProductList";
import Footer from "../components/Footer";
import ProductOverview from "../components/ProductOverview";
import ProductFeatures from "../components/ProductFeatures";
import SimiliarProductsList from "../components/SimiliarProductsList";
import SellerFeedback from "../components/SellerFeedback";
import BidHistory from "../components/BidHistory";
import QuestionsHistory from "../components/QuestionsHistory";

import { useEffect } from "react";

const ProductDetails = () => {
  useEffect(() => {
    document.title = "Product Details — eBid";
  }, []);

  return (
    <>
      <Header />
      <ProductOverview />
      <ProductFeatures />
      <SimiliarProductsList />
      <SellerFeedback />
      <BidHistory />
      <QuestionsHistory />
    </>
  );
};

export default ProductDetails;
