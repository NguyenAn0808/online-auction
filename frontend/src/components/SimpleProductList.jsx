import React from "react";
import SimpleProductCard from "./SimpleProductCard";
import productsMock from "../data/products.json";

const SimpleProductList = ({ title, products = [], limit = 5 }) => {
  // Fallback to sample products if no products provided
  const sampleProducts = productsMock.map((p) => ({
    ...p,
    thumbnail:
      p.images?.find((img) => img.is_thumbnail)?.image_url ||
      "/images/sample.jpg",
  }));

  const displayProducts = products.length > 0 ? products : sampleProducts;

  // Limit to top N products (default 5)
  const limitedProducts = displayProducts.slice(0, limit);

  return (
    <>
      <div className="my-12">
        <h2 className="text-2xl text-center font-bold my-3">{title}</h2>

        <div className="flex justify-center px-4 py-2">
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {limitedProducts.map((product) => (
              <SimpleProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleProductList;
