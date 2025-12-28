import api from "./api";
import { productAPI } from "./productService";

/**
 * Watchlist service - handles watchlist API calls
 * Integrates with backend API while maintaining localStorage as fallback cache
 */
const KEY = "ea_watchlist_v1";

// Fallback localStorage functions (for offline/cache support)
function loadCache() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("watchlist: failed to parse cache", e);
    return [];
  }
}

function saveCache(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("watchlist: failed to save cache", e);
  }
}

/**
 * Get user watchlist from backend
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of product IDs
 */
export async function getWatchlist(userId) {
  try {
    const response = await api.get(`/api/watchlist?user_id=${userId}`);
    // Backend returns { success: true, data: [...] }
    const productIds = Array.isArray(response.data?.data) 
      ? response.data.data 
      : Array.isArray(response.data) 
        ? response.data 
        : [];
    
    // Fetch full product details for each ID
    const products = await Promise.all(
      productIds.map(async (productId) => {
        try {
          const product = await productService.getProductById(productId);
          return {
            id: product._id || product.id || productId,
            name: product.name,
            imageSrc: product.thumbnail || product.images?.[0]?.image_url || "/images/sample.jpg",
            price: product.current_price || product.start_price || 0,
            timeRemaining: product.end_time ? calculateTimeRemaining(product.end_time) : null,
            description: product.description,
          };
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      })
    );
    
    const validProducts = products.filter((p) => p !== null);
    // Cache for offline access
    saveCache(validProducts);
    return validProducts;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    // Return cached data as fallback
    return loadCache();
  }
}

/**
 * Add product to watchlist
 * @param {string} userId - User UUID
 * @param {string} productId - Product UUID
 * @returns {Promise<void>}
 */
export async function addToWatchlist(userId, productId) {
  try {
    await api.post(`/api/watchlist`, {
      user_id: userId,
      product_id: productId,
    });
    
    // Update cache
    const cache = loadCache();
    if (!cache.some((p) => p.id === productId)) {
      // Fetch product details to add to cache
      try {
        const product = await productAPI.getProductById(productId);
        cache.unshift({
          id: productId,
          name: product.name,
          imageSrc: product.thumbnail || product.images?.[0]?.image_url || "/images/sample.jpg",
          price: product.current_price || product.start_price || 0,
          timeRemaining: product.end_time ? calculateTimeRemaining(product.end_time) : null,
          description: product.description,
        });
        saveCache(cache);
      } catch (error) {
        console.error("Error fetching product for cache:", error);
      }
    }
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
}

/**
 * Remove product from watchlist
 * @param {string} userId - User UUID
 * @param {string} productId - Product UUID
 * @returns {Promise<void>}
 */
export async function removeFromWatchlist(userId, productId) {
  try {
    await api.delete(`/api/watchlist/${userId}/${productId}`);
    
    // Update cache
    const cache = loadCache().filter((p) => p.id !== productId);
    saveCache(cache);
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
}

/**
 * Check if product is in watchlist (uses cache for quick check)
 * @param {string} productId - Product UUID
 * @returns {boolean}
 */
export function isInWatchlist(productId) {
  if (!productId) return false;
  const cache = loadCache();
  return cache.some((p) => p.id === productId);
}

/**
 * Clear watchlist cache
 */
export function clearWatchlistCache() {
  saveCache([]);
}

/**
 * Helper function to calculate time remaining until end time
 * @param {string} endTime - ISO date string
 * @returns {string} Formatted time remaining (e.g., "2d 5h")
 */
function calculateTimeRemaining(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return "Ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  clearWatchlistCache,
};
