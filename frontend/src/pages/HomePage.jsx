import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SimpleProductList from "../components/SimpleProductList";
import Carousel from "../components/Carousel";
import CategorySection from "../components/CategorySection";
import productService from "../services/productService";

const HomePage = () => {
  const [topEndingProducts, setTopEndingProducts] = useState([]);
  const [topBidProducts, setTopBidProducts] = useState([]);
  const [topPriceProducts, setTopPriceProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ending, bid, price] = await Promise.all([
          productService.getTopEndingProducts(5),
          productService.getTopBidProducts(5),
          productService.getTopPriceProducts(5),
        ]);

        setTopEndingProducts(ending);
        setTopBidProducts(bid);
        setTopPriceProducts(price);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        // Set empty arrays on error to prevent UI breaking
        setTopEndingProducts([]);
        setTopBidProducts([]);
        setTopPriceProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Carousel />
      <CategorySection />
      <SimpleProductList
        title="Top 5 products nearing end time"
        products={topEndingProducts}
      />
      <SimpleProductList
        title="Top 5 products with the most bids"
        products={topBidProducts}
      />
      <SimpleProductList
        title="Top 5 products with the highest price"
        products={topPriceProducts}
      />
    </>
  );
};

export default HomePage;
