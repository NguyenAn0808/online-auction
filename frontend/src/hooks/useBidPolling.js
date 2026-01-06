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
  const [notFound, setNotFound] = useState(false);

  const fetchBids = useCallback(async () => {
    if (!productId) return;

    try {
      const response = await api.get(`/api/bids/product/${productId}`);

      // Extract data from {success: true, data: [...]} response format
      let bidsData = response.data?.data || response.data || [];

      // If data is an object with a bids property, extract that
      if (
        bidsData &&
        typeof bidsData === "object" &&
        !Array.isArray(bidsData)
      ) {
        bidsData = bidsData.bids || [];
      }

      setBids(Array.isArray(bidsData) ? bidsData : []);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      }
      console.error("Failed to fetch bids:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  usePolling(fetchBids, POLLING_INTERVALS.BIDS, enabled && !notFound);

  // Get highest bid (excluding rejected bids)
  const activeBids = bids.filter(bid => bid.status !== 'rejected');
  const highestBid =
    activeBids.length > 0
      ? activeBids.reduce((max, bid) => (bid.amount > max.amount ? bid : max))
      : null;

  return {
    bids,
    highestBid,
    bidCount: bids.length,
    loading,
    refetch: fetchBids,
  };
};
