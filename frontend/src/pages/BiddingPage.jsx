import React from "react";
import Header from "../components/Header";
import BidHistory from "../components/BidHistory";
import BidProduct from "../components/BidProduct";

export const BiddingPage = () => {
  return (
    <>
      <Header />
      <BidProduct />
      <BidHistory />
    </>
  );
};
