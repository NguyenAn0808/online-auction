import Bid from "../models/Bid.js";
import BlockedBidderModel from "../models/blocked-bidder.model.js";
import ProductModel from "../models/product.model.js";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
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
    // Store the previous price holder from the product table (before competition)
    const previousPriceHolder = product.price_holder;

    // 7. ALWAYS ADD NEW BID (History requirement: one user can bid many times)
    // We don't update existing bids anymore. Every bid action is a new record.
    const initialAmount = minBid;
    bidRecord = await Bid.add({
      product_id,
      bidder_id,
      amount: initialAmount,
      max_bid: maxBidAmount,
    });

    // 7. PROCESS AUTO-BID COMPETITION
    const competitionResult = await this.processAutoBidCompetition(
      product_id,
      startPrice,
      stepPrice
    );

    // 8. UPDATE PRODUCT'S CURRENT PRICE AND HOLDER
    await ProductModel.updateCurrentPrice(
      product_id,
      competitionResult.winningAmount,
      competitionResult.price_holder
    );

    // 8.5. CHECK AND APPLY AUTO-EXTEND if product has auto_extend enabled
    let extendedTime = null;
    if (product.auto_extend) {
      extendedTime = await this.checkAndExtendAuction(
        product_id,
        product.end_time
      );
    }

    // 9. SEND NOTIFICATIONS (async, fire-and-forget)
    this.sendBidNotifications(
      product,
      bidder_id,
      competitionResult,
      previousPriceHolder,
      extendedTime
    );

    // Return the updated bid with competition result
    return {
      ...bidRecord,
      competition: competitionResult,
      extended_time: extendedTime,
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
      return {
        winner: null,
        winningAmount: startPrice,
        price_holder: null,
        allBids: [],
      };
    }

    if (activeBids.length === 1) {
      // Only one bidder - they win at start price or their current amount
      const winner = activeBids[0];
      // If only one bid exists, price matches start price
      const winningAmount = startPrice;

      await Bid.updateAmount(winner.id, winningAmount);
      return {
        winner: { ...winner, amount: winningAmount },
        winningAmount,
        price_holder: winner.bidder_id, // Winner holds the product
        allBids: activeBids,
      };
    }

    // Multiple bidders - determine winner
    // Winner is the one with highest max_bid (to break ties: earliest timestamp)
    const winner = activeBids[0];

    // Find second highest DISTINCT bidder
    let secondHighest = null;
    for (let i = 1; i < activeBids.length; i++) {
      if (activeBids[i].bidder_id !== winner.bidder_id) {
        secondHighest = activeBids[i];
        break;
      }
    }

    if (!secondHighest) {
      // Only one distinct bidder (but maybe multiple bids from them)
      // Price stays at startPrice (or minimum possible)
      const winningAmount = startPrice;
      await Bid.updateAmount(winner.id, winningAmount);
      return {
        winner: { ...winner, amount: winningAmount },
        winningAmount,
        price_holder: winner.bidder_id,
        allBids: activeBids,
      };
    }

    const winnerMaxBid = Math.round(parseFloat(winner.max_bid));
    const secondMaxBid = Math.round(parseFloat(secondHighest.max_bid));

    // Logic: Winning amount is the second highest max_bid exactly
    // But must be at least startPrice and at most winnerMaxBid
    let winningAmount = secondMaxBid + stepPrice;

    // Special case: if multiple people have the EXACT same max_bid,
    // the first one (winner) wins at their full max_bid
    if (winnerMaxBid === secondMaxBid) {
      winningAmount = winnerMaxBid;
    }

    // Ensure winningAmount is at least startPrice
    if (winningAmount < startPrice) {
      winningAmount = startPrice;
    }

    // Cap winningAmount at winnerMaxBid
    if (winningAmount > winnerMaxBid) {
      winningAmount = winnerMaxBid;
    }

    // Update winner's bid amount to the calculated price
    await Bid.updateAmount(winner.id, winningAmount);

    // Update ALL other bids
    for (const bid of activeBids) {
      if (bid.id !== winner.id) {
        if (bid.bidder_id !== winner.bidder_id) {
          // This is a bid from someone else - they lost, so they lost at their max
          await Bid.updateAmount(bid.id, Math.round(parseFloat(bid.max_bid)));
        } else {
          // This is a previous (superseded) bid from the current winner.
          // We set it to startPrice so it doesn't interfere with "highest bid" logic in UI.
          await Bid.updateAmount(bid.id, startPrice);
        }
      }
    }

    return {
      winner: { ...winner, amount: winningAmount },
      winningAmount,
      secondPlace: { ...secondHighest, amount: secondMaxBid },
      price_holder: winner.bidder_id, // Winner holds the product
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
    previousPriceHolder,
    extendedTime = null
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

        // To previous price holder if they were outbid
        // Only send if there was a previous holder and they are no longer winning
        if (
          previousPriceHolder &&
          previousPriceHolder !== bidderId &&
          competitionResult.price_holder !== previousPriceHolder
        ) {
          const previousBidder = await User.findById(previousPriceHolder);
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
    const bids = await Bid.getByProduct(product_id, status);
    const product = await ProductModel.findById(product_id);
    const blockedBidders = await BlockedBidderModel.getByProduct(product_id);

    return {
      bids,
      product: product,
      blockedBidders,
    };
  }

  static async denyBidder(product_id, bidder_id, seller_id) {
    // 1. VERIFY SELLER
    const product = await ProductModel.findById(product_id);
    if (!product) throw new Error("Product not found");
    if (product.seller_id !== seller_id) {
      throw new Error("Unauthorized: Only the seller can deny bidders");
    }

    // 2. BLOCK BIDDER
    await BlockedBidderModel.create(product_id, bidder_id);

    // 3. REJECT ALL BIDS FROM THIS BIDDER
    await Bid.rejectBidsByUser(product_id, bidder_id);

    // 4. RECALCULATE COMPETITION
    // Since this bidder is now out, we need to re-run the auto-bid logic
    // to find the new winner and price among remaining valid bids.
    const startPrice = Math.round(parseFloat(product.start_price || 0));
    const stepPrice = Math.round(parseFloat(product.step_price || 0));

    const competitionResult = await this.processAutoBidCompetition(
      product_id,
      startPrice,
      stepPrice
    );

    // 5. UPDATE PRODUCT PRICE & HOLDER
    // Even if there are no bids left, competitionResult handles that (winner=null)
    const newPrice = competitionResult.winningAmount;
    const newHolder = competitionResult.price_holder;

    await ProductModel.updateCurrentPrice(product_id, newPrice, newHolder);

    // 6. NOTIFY (Optional: notify new winner, etc.)
    // For now we might just return the result.
    // Ideally we should notify the denied bidder.

    return {
      success: true,
      message: "Bidder denied and blocked. Auction recalculated.",
      competition: competitionResult,
    };
  }

  static async unblockBidder(product_id, bidder_id, seller_id) {
    // 1. VERIFY SELLER
    const product = await ProductModel.findById(product_id);
    if (!product) throw new Error("Product not found");
    if (product.seller_id !== seller_id) {
      throw new Error("Unauthorized: Only the seller can unblock bidders");
    }

    // 2. UNBLOCK BIDDER
    await BlockedBidderModel.remove(product_id, bidder_id);

    // 3. RESTORE BIDS
    await Bid.restoreBidsByUser(product_id, bidder_id);

    // 4. RECALCULATE COMPETITION
    const startPrice = Math.round(parseFloat(product.start_price || 0));
    const stepPrice = Math.round(parseFloat(product.step_price || 0));

    const competitionResult = await this.processAutoBidCompetition(
      product_id,
      startPrice,
      stepPrice
    );

    // 5. UPDATE PRODUCT PRICE & HOLDER
    const newPrice = competitionResult.winningAmount;
    const newHolder = competitionResult.price_holder;

    await ProductModel.updateCurrentPrice(product_id, newPrice, newHolder);

    return {
      success: true,
      message: "Bidder unblocked and bids restored. Auction recalculated.",
      competition: competitionResult,
    };
  }

  static async getBidsByUser(bidder_id) {
    return Bid.getByUser(bidder_id);
  }

  static async getBidById(bid_id) {
    return Bid.getById(bid_id);
  }

  /**
   * Check if bid is within threshold time before auction end
   * If yes, extend the auction by configured duration
   * @param {string} product_id
   * @param {Date} current_end_time
   * @returns {Date|null} New end time if extended, null otherwise
   */
  static async checkAndExtendAuction(product_id, current_end_time) {
    try {
      // Get auto-extend settings from database
      const settings = await Settings.getAutoExtendSettings();
      const thresholdMinutes = settings.threshold_minutes || 5;
      const extensionMinutes = settings.extension_minutes || 10;

      const now = new Date();
      const endTime = new Date(current_end_time);
      const timeUntilEnd = endTime - now; // milliseconds
      const minutesUntilEnd = timeUntilEnd / (1000 * 60);

      // Check if bid is within threshold time
      if (minutesUntilEnd > 0 && minutesUntilEnd <= thresholdMinutes) {
        // Extend auction by configured minutes
        const newEndTime = new Date(
          endTime.getTime() + extensionMinutes * 60 * 1000
        );

        // Update product end_time
        await ProductModel.updateEndTime(product_id, newEndTime);

        console.log(
          `Auction ${product_id} extended by ${extensionMinutes} minutes. New end time: ${newEndTime}`
        );
        return newEndTime;
      }

      return null;
    } catch (error) {
      console.error("Error in checkAndExtendAuction:", error);
      return null; // Don't fail the bid if auto-extend fails
    }
  }
}

export default BidService;
