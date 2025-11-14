import React from "react";
import SimpleProductCard from "./SimpleProductCard";

const SimpleProductList = ({ title, products = [] }) => {
  // Fallback to sample products if no products provided
  const sampleProducts = [
    {
      id: 1,
      name: "Đây là tên sản phẩm đây là tên sản phẩm đây là tên sản phẩm đây là tên sản phẩm",
      price: 1000000000,
      image: "/images/sample.jpg",
    },
    {
      id: 2,
      name: "Sản phẩm thứ hai",
      price: 500000000,
      image: "/images/sample.jpg",
    },
    {
      id: 3,
      name: "Sản phẩm thứ ba",
      price: 750000000,
      image: "/images/sample.jpg",
    },
    {
      id: 4,
      name: "Sản phẩm thứ tư",
      price: 50000000,
      image: "/images/sample.jpg",
    },
    {
      id: 5,
      name: "Sản phẩm thứ năm",
      price: 1250000000,
      image: "/images/sample.jpg",
    },
  ];

  const displayProducts = products.length > 0 ? products : sampleProducts;

  // Map API data to component format
  const mappedProducts = displayProducts.map((product) => ({
    id: product._id || product.id,
    name: product.name,
    price: product.current_price || product.price || product.start_price,
    image: product.thumbnail || product.image || "/images/sample.jpg",
  }));

  return (
    <>
      <div className="my-12">
        <h2 className="text-2xl text-center font-bold my-3">{title}</h2>

        <div className="w-full flex justify-center p-4">
          <div className="grid grid-cols-5 gap-4">
            {mappedProducts.map((product) => (
              <SimpleProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleProductList;
