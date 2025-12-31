import { useEffect, useState } from "react";
import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SimpleProductCard from "./SimpleProductCard";

export default function SimiliarProductsList({
  categoryId = null,
  currentProductId = null,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await productService.getSimilarProducts(categoryId);

        // Filter out current product and ensure result is an array
        const filtered = (Array.isArray(result) ? result : []).filter(
          (p) => p.id !== currentProductId
        );
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching similar products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarProducts();
  }, [categoryId, currentProductId]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontSize: TYPOGRAPHY.SIZE_HEADING,
            fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
            color: COLORS.MIDNIGHT_ASH,
          }}
        >
          You might also like
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <SimpleProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
