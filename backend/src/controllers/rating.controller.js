import RatingService from "../services/rating.service.js";

class RatingController {
    // GET /:user_id/eligibility
    static async getUserRatingEligibility(req, res) {
      // Stub implementation, update logic as needed
      return res.status(200).json({ success: true, eligible: true });
    }
  static async addRating(req, res) {
    try {
      const { product_id, reviewer_id, target_user_id, score, comment } = req.body;
      if (!product_id || !reviewer_id || !target_user_id || !score)
        return res.status(400).json({ success: false, message: "Missing required fields" });
      const rating = await RatingService.addRating({ product_id, reviewer_id, target_user_id, score, comment });
      return res.status(201).json({ success: true, data: rating });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserRatings(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) return res.status(400).json({ success: false, message: "Missing user_id" });
      const result = await RatingService.getUserRatings(user_id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserScoreCount(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) return res.status(400).json({ success: false, message: "Missing user_id" });
      const result = await RatingService.getUserScoreCount(user_id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default RatingController;
