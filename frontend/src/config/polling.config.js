/**
 * Simple Polling Configuration
 * For small-scale auction project (~20 products, 4-5 bids each)
 */

// Simple polling intervals - adjust based on your needs
export const POLLING_INTERVALS = {
  AUCTION: 3000, // 3 seconds - Auction detail page
  BIDS: 3000, // 3 seconds - Bid updates
  COUNTDOWN: 1000, // 1 second - Countdown timer
};

export default POLLING_INTERVALS;
