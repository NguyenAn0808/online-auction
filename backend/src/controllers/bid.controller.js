import BidService from "../services/bid.service.js";

class BidController {
  static async addBid(req, res) {
    try {
      const bidder_id = req.user.id;
      const { product_id, amount } = req.body;
      if (!product_id || !amount)
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      const bid = await BidService.addBid({ product_id, bidder_id, amount });
      return res.status(201).json({ success: true, data: bid });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProductBids(req, res) {
    try {
      const { product_id, status } = req.query;
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
