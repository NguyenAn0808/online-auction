import Bid from "../models/Bid.js";
import BlockedBidderModel from "../models/blocked-bidder.model.js";
import ProductModel from "../models/product.model.js";
import User from "../models/User.js";
import * as EmailService from "./emailService.js";

class BidService {
  static async addBid(data) {
    const { product_id, bidder_id, amount } = data;

    // 1. CHECK IF BLOCKED
    const isBlocked = await BlockedBidderModel.isBlocked(product_id, bidder_id);
    if (isBlocked) {
      throw new Error(
        "You have been denied by the seller from bidding on this product."
      );
    }

    const product = await ProductModel.findById(product_id);
    if (!product) throw new Error("Product not found");

    const newBid = await Bid.add(data);
    // Send email when bid place succesfully (to bidder, seller, previous highest bidder)
    (async () => {
      try {
        // To bidder
        const currentBidder = await User.findById(bidder_id);
        if (currentBidder?.email) {
          await EmailService.sendBidSuccessEmailToBidder(
            currentBidder.email,
            currentBidder.full_name,
            product.name,
            amount
          );
        }

        // To seller
        const seller = await User.findById(product.seller_id);
        if (seller?.email) {
          await EmailService.sendBidNotificationToSeller(
            seller.email,
            product.name,
            amount,
            currentBidder.full_name
          );
        }

        // To previous highest bidder
        const previousHighestBid = await Bid.getHighest(product_id);
        if (previousHighestBid && previousHighestBid.bidder_id !== bidder_id) {
          const previousBidder = await User.findById(
            previousHighestBid.bidder_id
          );
          if (previousBidder?.email) {
            await EmailService.sendOutbidEmailToPreviousBidder(
              previousBidder.email,
              product.name,
              amount,
              currentBidder.full_name
            );
          }
        }
      } catch (error) {
        console.error("❌ Error sending bid notification emails:", error);
      }
    })();

    return newBid;
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
