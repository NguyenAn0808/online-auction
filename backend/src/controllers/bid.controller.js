import BidService from "../services/bid.service.js";

class BidController {
  /**
   * Add auto-bid for a product
   * Auto-bid system: User sets max_bid, system automatically bids just enough to win
   * @body { product_id, max_bid } - bidder_id is taken from authenticated user
   */
  static async addBid(req, res) {
    try {
      const { product_id, max_bid } = req.body;
      const bidder_id = req.user?.id || req.body.bidder_id;

      if (!product_id || !max_bid) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: product_id and max_bid are required",
        });
      }

      if (!bidder_id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to place a bid",
        });
      }

      const bid = await BidService.addBid({ product_id, bidder_id, max_bid });
      return res.status(201).json({ success: true, data: bid });
    } catch (error) {
      // Return 400 for validation errors, 500 for server errors
      const statusCode =
        error.message.includes("must be at least") ||
        error.message.includes("can only increase") ||
        error.message.includes("denied by the seller")
          ? 400
          : 500;
      return res
        .status(statusCode)
        .json({ success: false, message: error.message });
    }
  }

  static async getProductBids(req, res) {
    try {
      // Support both query param (?product_id=xxx) and path param (/:productId)
      const product_id = req.query.product_id || req.params.productId;
      const { status } = req.query;
      
      if (!product_id)
        return res
          .status(400)
          .json({ success: false, message: "Missing product_id" });
      const bids = await BidService.getProductBids(product_id, status);
      return res.status(200).json({ success: true, data: bids });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get bids by current authenticated user
   * GET /api/bids/user
   */
  static async getBidsByUser(req, res) {
    try {
      const bidder_id = req.user?.id;
      if (!bidder_id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const bids = await BidService.getBidsByUser(bidder_id);
      return res.status(200).json({ success: true, data: bids });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async acceptBid(req, res) {
    try {
      const { bid_id } = req.params;
      if (!bid_id)
        return res
          .status(400)
          .json({ success: false, message: "Missing bid_id" });
      const bid = await BidService.acceptBid(bid_id);
      if (!bid)
        return res
          .status(404)
          .json({ success: false, message: "Bid not found" });
      return res.status(200).json({ success: true, data: bid });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async rejectBid(req, res) {
    try {
      const { bid_id } = req.params;
      if (!bid_id)
        return res
          .status(400)
          .json({ success: false, message: "Missing bid_id" });
      const bid = await BidService.rejectBid(bid_id);
      if (!bid)
        return res
          .status(404)
          .json({ success: false, message: "Bid not found" });
      return res.status(200).json({ success: true, data: bid });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default BidController;
