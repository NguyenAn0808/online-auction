import Bid from "../models/Bid.js";
import BlockedBidderModel from "../models/blocked-bidder.model.js";

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
    return Bid.add(data);
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
