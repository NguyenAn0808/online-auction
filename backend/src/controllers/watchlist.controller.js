import WatchlistService from "../services/watchlist.service.js";

class WatchlistController {
  static async addToWatchlist(req, res) {
    try {
      const { user_id, product_id } = req.body;
      if (!user_id || !product_id)
        return res.status(400).json({ success: false, message: "user_id and product_id required" });
      const result = await WatchlistService.addToWatchlist(user_id, product_id);
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeFromWatchlist(req, res) {
    try {
      const { user_id, product_id } = req.params;
      if (!user_id || !product_id)
        return res.status(400).json({ success: false, message: "user_id and product_id required" });
      const result = await WatchlistService.removeFromWatchlist(user_id, product_id);
      if (!result) return res.status(404).json({ success: false, message: "Not found" });
      return res.status(200).json({ success: true, message: "Removed", data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserWatchlist(req, res) {
    try {
      const { user_id } = req.query;
      if (!user_id)
        return res.status(400).json({ success: false, message: "user_id required" });
      const result = await WatchlistService.getUserWatchlist(user_id);
      if (!result)
        return res.status(404).json({ success: false, message: "User not found" });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default WatchlistController;
