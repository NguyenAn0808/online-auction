import React, { useEffect, useState } from "react";
import SimpleProductCard from "./SimpleProductCard";
import { productHelpers } from "../services/productService";

const SimpleProductList = ({ title, products = [], limit = 5 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (products && products.length > 0) {
        // Use provided products
        const mapped = products.map((p) => ({
          ...p,
          thumbnail:
            p.images?.find((img) => img.is_thumbnail)?.image_url ||
            p.thumbnail ||
            "/images/sample.jpg",
        }));
        if (isMounted) setItems(mapped.slice(0, limit));
        return;
      }

      // Fetch real products from API helpers
      setLoading(true);
      try {
        const fetched = await productHelpers.getTopEndingProducts(limit);
        const mapped = (fetched || []).map((p) => ({
          ...p,
          thumbnail:
            p.images?.find((img) => img.is_thumbnail)?.image_url ||
            p.thumbnail ||
            "/images/sample.jpg",
        }));
        if (isMounted) setItems(mapped.slice(0, limit));
      } catch (e) {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [products, limit]);

  return (
    <>
      <div className="my-12">
        <h2 className="text-2xl text-center font-bold my-3">{title}</h2>

        <div className="flex justify-center px-4 py-2">
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {items.map((product) => (
              <SimpleProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleProductList;
