import { useEffect, useState } from "react";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
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

        // Determine parent category of the current category
        let parentId = null;
        try {
          const catRes = await categoryService.getCategoryById(categoryId);
          const cat = catRes?.data || catRes;
          parentId = cat?.parent_id || null;
        } catch (e) {
          parentId = null;
        }

        // If no parent (top-level), fallback to same category products
        if (!parentId) {
          const resp = await productService.getProductsByCategory(
            categoryId,
            1,
            6
          );
          const items = resp?.items || [];
          const filtered = items
            .filter((p) => p.id !== currentProductId)
            .slice(0, 5);
          setProducts(filtered);
          return;
        }

        // Fetch products from all child categories under the same parent
        const siblings = await categoryService.getChildCategories(parentId);
        const siblingIds = (Array.isArray(siblings) ? siblings : []).map(
          (c) => c.id
        );

        const results = await Promise.all(
          siblingIds.map(async (id) => {
            try {
              const r = await productService.getProductsByCategory(id, 1, 5);
              return r?.items || [];
            } catch (err) {
              return [];
            }
          })
        );

        const merged = results.flat();
        const uniqMap = new Map();
        for (const p of merged) {
          if (p && p.id && p.id !== currentProductId && !uniqMap.has(p.id)) {
            uniqMap.set(p.id, p);
          }
        }
        const uniq = Array.from(uniqMap.values()).slice(0, 5);
        setProducts(uniq);
      } catch (error) {
        console.error("Error fetching similar products by parent:", error);
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

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product) => (
          <SimpleProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
