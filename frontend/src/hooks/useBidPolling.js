import { useState, useCallback } from "react";
import { usePolling } from "./usePolling";
import api from "../services/api";
import { POLLING_INTERVALS } from "../config/polling.config";

/**
 * Poll for bid updates
 * @param {number} productId - Product ID
 * @param {boolean} enabled - Enable polling (default: true)
 */
export const useBidPolling = (productId, enabled = true) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = useCallback(async () => {
    if (!productId) return;

    try {
      const response = await api.get(`/bids/product/${productId}`);
      setBids(response.data || []);
    } catch (err) {
      console.error("Failed to fetch bids:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  usePolling(fetchBids, POLLING_INTERVALS.BIDS, enabled);

  // Get highest bid
  const highestBid =
    bids.length > 0
      ? bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max))
      : null;

  return {
    bids,
    highestBid,
    bidCount: bids.length,
    loading,
    refetch: fetchBids,
  };
};
