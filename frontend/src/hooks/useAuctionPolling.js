import { useState, useCallback } from "react";
import { usePolling } from "./usePolling";
import api from "../services/api";
import { POLLING_INTERVALS } from "../config/polling.config";

/**
 * Poll for auction updates
 * @param {number} productId - Product ID
 * @param {boolean} enabled - Enable polling (default: true)
 */
export const useAuctionPolling = (productId, enabled = true) => {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchAuctionData = useCallback(async () => {
    if (!productId) return;

    try {
      const response = await api.get(`/api/products/${productId}`);
      setAuctionData(response.data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
      console.error("Failed to fetch auction:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Stop polling when auction ends or product not found
  const hasEnded = auctionData?.status === "ended";

  usePolling(fetchAuctionData, POLLING_INTERVALS.AUCTION, enabled && !hasEnded && !notFound);

  return { auctionData, loading, refetch: fetchAuctionData };
};
