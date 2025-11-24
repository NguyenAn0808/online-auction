import Watchlist from "../models/Watchlist.js";

class WatchlistService {
  static async addToWatchlist(user_id, product_id) {
    return Watchlist.add(user_id, product_id);
  }

  static async removeFromWatchlist(user_id, product_id) {
    return Watchlist.remove(user_id, product_id);
  }

  static async getUserWatchlist(user_id) {
    return Watchlist.getByUser(user_id);
  }

  static async isProductWatched(user_id, product_id) {
    return Watchlist.isOnWatchlist(user_id, product_id);
  }
}

export default WatchlistService;
