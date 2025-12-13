import Rating from "../models/Rating.js";

class RatingService {
  static async addRating(data) {
    return Rating.add(data);
  }

  static async getUserRatings(target_user_id) {
    return Rating.getUserRatings(target_user_id);
  }

  static async getUserScoreCount(target_user_id) {
    return Rating.getUserScoreAndCount(target_user_id);
  }

  static async getUserRatingByReviewerAndProduct(target_user_id, reviewer_id, product_id) {
    return Rating.getUserRatingByReviewerAndProduct(target_user_id, reviewer_id, product_id);
  }
}

export default RatingService;
