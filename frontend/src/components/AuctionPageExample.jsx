/**
 * Simple Auction Page Example
 * Shows how to use polling hooks for real-time updates
 */

import React from "react";
import { useAuctionPolling } from "../hooks/useAuctionPolling";
import { useBidPolling } from "../hooks/useBidPolling";
import { useAuctionCountdown } from "../hooks/useAuctionCountdown";

const AuctionPageExample = ({ productId }) => {
  // Poll auction data every 3 seconds
  const { auctionData, loading } = useAuctionPolling(productId);

  // Poll bids every 3 seconds
  const { bids, highestBid, bidCount } = useBidPolling(productId);

  // Countdown timer (updates every second)
  const { timeRemaining, hasEnded } = useAuctionCountdown(
    auctionData?.end_time,
    () => console.log("Auction ended!")
  );

  if (loading) return <div>Loading...</div>;
  if (!auctionData) return <div>Auction not found</div>;

  return (
    <div className="auction-page">
      <h1>{auctionData.name}</h1>

      {/* Countdown */}
      <div className="countdown">
        {hasEnded ? "⏱️ Ended" : `⏰ ${timeRemaining?.formatted}`}
      </div>

      {/* Current Bid */}
      <div className="current-bid">
        <h2>Current Bid</h2>
        <div className="price">
          ${highestBid?.amount || auctionData.current_price}
        </div>
      </div>

      {/* Total Bids */}
      <div className="bid-count">📊 {bidCount} bid(s)</div>

      {/* Bid History */}
      <div className="bid-history">
        <h3>Recent Bids</h3>
        {bids.slice(0, 5).map((bid) => (
          <div key={bid.id}>
            {bid.bidder_name} - ${bid.amount}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionPageExample;
