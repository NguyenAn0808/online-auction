import Bid from "../models/Bid.js";

class BidService {
  static async addBid(data) {
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
