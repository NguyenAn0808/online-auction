import { useEffect, useState } from "react";
import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function SimiliarProductsList() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setProducts(productService.getSimilarProducts());
  }, []);

  const handleCardClick = (productId) => {
    navigate(`/products/${productId}`);
    window.scrollTo(0, 0);
  };
  return (
    <>
      <h2
        style={{
          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
          fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
          color: COLORS.MIDNIGHT_ASH,
        }}
      >
        Customers also bought
      </h2>

      <div
        style={{
          marginTop: SPACING.L,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: SPACING.L,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleCardClick(product.id)}
            style={{
              backgroundColor: COLORS.WHITE,
              border: `1px solid ${COLORS.MORNING_MIST}33`,
              borderRadius: BORDER_RADIUS.MEDIUM,
              boxShadow: SHADOWS.SUBTLE,
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.01)";
              e.currentTarget.style.boxShadow = `0 4px 6px rgba(0,0,0,0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = SHADOWS.SUBTLE;
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  height: "280px",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  insetX: 0,
                  top: 0,
                  display: "flex",
                  height: "280px",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                  padding: SPACING.M,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    insetX: 0,
                    bottom: 0,
                    height: "120px",
                    background: "linear-gradient(to top, black, transparent)",
                    opacity: 0.5,
                  }}
                />
                <p
                  style={{
                    position: "relative",
                    fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.WHITE,
                  }}
                >
                  ${product.price}
                </p>
              </div>
            </div>

            <div style={{ padding: SPACING.M }}>
              <h3
                style={{
                  fontSize: TYPOGRAPHY.SIZE_BODY,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                  margin: 0,
                }}
              >
                {product.name}
              </h3>
              <p
                style={{
                  marginTop: SPACING.S,
                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                  color: COLORS.PEBBLE,
                  margin: 0,
                }}
              >
                {product.color}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
