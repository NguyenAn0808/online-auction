import Bid from "../models/Bid.js";
import BlockedBidderModel from "../models/blocked-bidder.model.js";
import ProductModel from "../models/product.model.js";
import User from "../models/User.js";
import * as EmailService from "./emailService.js";

class BidService {
  /**
   * Add a new auto-bid or update existing max_bid
   * Auto-bid system: User sets max_bid, system automatically bids just enough to win
   * @param {Object} data - { product_id, bidder_id, max_bid }
   */
  static async addBid(data) {
    const { product_id, bidder_id, max_bid } = data;

    // 1. CHECK IF BLOCKED
    const isBlocked = await BlockedBidderModel.isBlocked(product_id, bidder_id);
    if (isBlocked) {
      throw new Error(
        "You have been denied by the seller from bidding on this product."
      );
    }

    // 2. GET PRODUCT
    const product = await ProductModel.findById(product_id);
    if (!product) throw new Error("Product not found");

    // Use parseFloat and Math.round to avoid floating-point precision issues
    const startPrice = Math.round(parseFloat(product.start_price || 0));
    const stepPrice = Math.round(parseFloat(product.step_price || 0));

    // 3. CHECK IF USER ALREADY HAS A BID ON THIS PRODUCT
    const existingBid = await Bid.getByProductAndBidder(product_id, bidder_id);

    // 4. GET CURRENT HIGHEST BID
    const currentHighest = await Bid.getHighest(product_id);
    const currentPrice = currentHighest
      ? Math.round(parseFloat(currentHighest.amount))
      : startPrice;

    // 5. CALCULATE MINIMUM REQUIRED BID
    const minBid = currentHighest ? currentPrice + stepPrice : startPrice;

    // 6. VALIDATE MAX_BID (round to avoid floating point issues)
    const maxBidAmount = Math.round(parseFloat(max_bid));
    if (maxBidAmount < minBid) {
      throw new Error(
        `Maximum bid must be at least ${minBid.toLocaleString("vi-VN")} VND`
      );
    }

    let bidRecord;
    const previousHighestBidderId = currentHighest?.bidder_id;

    if (existingBid) {
      // User is updating their max_bid - only allow increasing
      const existingMaxBid = Math.round(parseFloat(existingBid.max_bid));
      if (maxBidAmount <= existingMaxBid) {
        throw new Error(
          `You can only increase your maximum bid. Current max: ${existingMaxBid.toLocaleString("vi-VN")} VND`
        );
      }
      // Update existing bid's max_bid
      bidRecord = await Bid.updateMaxBid(existingBid.id, maxBidAmount);
    } else {
      // New bid - calculate initial amount
      const initialAmount = minBid;
      bidRecord = await Bid.add({
        product_id,
        bidder_id,
        amount: initialAmount,
        max_bid: maxBidAmount,
      });
    }

    // 7. PROCESS AUTO-BID COMPETITION
    const competitionResult = await this.processAutoBidCompetition(
      product_id,
      startPrice,
      stepPrice
    );

    // 8. UPDATE PRODUCT'S CURRENT PRICE
    if (competitionResult.winningAmount) {
      await ProductModel.updateCurrentPrice(product_id, competitionResult.winningAmount);
    }

    // 9. SEND NOTIFICATIONS (async, fire-and-forget)
    this.sendBidNotifications(
      product,
      bidder_id,
      competitionResult,
      previousHighestBidderId
    );

    // Return the updated bid with competition result
    return {
      ...bidRecord,
      competition: competitionResult,
    };
  }

  /**
   * Process auto-bid competition for a product
   * Determines the winner and calculates the winning bid amount
   * @param {string} product_id
   * @param {number} startPrice
   * @param {number} stepPrice
   * @returns {Object} { winner, winningAmount, allBids }
   */
  static async processAutoBidCompetition(product_id, startPrice, stepPrice) {
    // Get all active bids ordered by max_bid DESC, timestamp ASC
    const activeBids = await Bid.getActiveBidsForCompetition(product_id);

    if (activeBids.length === 0) {
      return { winner: null, winningAmount: startPrice, allBids: [] };
    }

    if (activeBids.length === 1) {
      // Only one bidder - they win at start price or their current amount
      const winner = activeBids[0];
      const currentAmount = Math.round(parseFloat(winner.amount));
      const winningAmount = Math.max(startPrice, currentAmount);
      await Bid.updateAmount(winner.id, winningAmount);
      return {
        winner: { ...winner, amount: winningAmount },
        winningAmount,
        allBids: activeBids,
      };
    }

    // Multiple bidders - determine winner
    // Winner is the one with highest max_bid (or earliest timestamp if tied)
    const winner = activeBids[0]; // Already sorted by max_bid DESC, timestamp ASC
    const secondHighest = activeBids[1];

    // Use Math.round to ensure integer values (avoid floating point issues)
    const winnerMaxBid = Math.round(parseFloat(winner.max_bid));
    const secondMaxBid = Math.round(parseFloat(secondHighest.max_bid));

    // Winning amount = second highest max_bid + step_price (capped at winner's max_bid)
    let winningAmount = secondMaxBid + stepPrice;

    // Cap at winner's max_bid
    if (winningAmount > winnerMaxBid) {
      winningAmount = winnerMaxBid;
    }

    // Ensure winning amount is at least start_price
    winningAmount = Math.max(winningAmount, startPrice);

    // Update winner's bid amount
    await Bid.updateAmount(winner.id, winningAmount);

    // Update second place bid amount to their max (they lost but show what they bid)
    await Bid.updateAmount(secondHighest.id, secondMaxBid);

    return {
      winner: { ...winner, amount: winningAmount },
      winningAmount,
      secondPlace: { ...secondHighest, amount: secondMaxBid },
      allBids: activeBids,
    };
  }

  /**
   * Send bid notifications asynchronously
   */
  static sendBidNotifications(
    product,
    bidderId,
    competitionResult,
    previousHighestBidderId
  ) {
    (async () => {
      try {
        const currentBidder = await User.findById(bidderId);
        const winningAmount = competitionResult.winningAmount;

        // To bidder - confirmation
        if (currentBidder?.email) {
          await EmailService.sendBidSuccessEmailToBidder(
            currentBidder.email,
            currentBidder.full_name,
            product.name,
            winningAmount
          );
        }

        // To seller - new bid notification
        const seller = await User.findById(product.seller_id);
        if (seller?.email) {
          await EmailService.sendBidNotificationToSeller(
            seller.email,
            product.name,
            winningAmount,
            currentBidder?.full_name || "A bidder"
          );
        }

        // 1. To previous highest bidder if they were outbid
        if (
          previousHighestBidderId &&
          previousHighestBidderId !== bidderId &&
          competitionResult.winner?.bidder_id !== previousHighestBidderId
        ) {
          const previousBidder = await User.findById(previousHighestBidderId);
          if (previousBidder?.email) {
            await EmailService.sendOutbidEmailToPreviousBidder(
              previousBidder.email,
              previousBidder.full_name,
              product.name,
              winningAmount
            );
          }
        }
      } catch (error) {
        console.error("❌ Error sending bid notification emails:", error);
      }
    })();
  }

  static async getProductBids(product_id, status) {
    return Bid.getByProduct(product_id, status);
  }

  static async acceptBid(bid_id) {
    return Bid.accept(bid_id);
  }

  static async rejectBid(bid_id) {
    return Bid.reject(bid_id);
  }

  static async getBidsByUser(bidder_id) {
    return Bid.getByUser(bidder_id);
  }

  static async getBidById(bid_id) {
    return Bid.getById(bid_id);
  }
}

export default BidService;
