import express from "express";
import WatchlistController from "../controllers/watchlist.controller.js";

const router = express.Router();

// GET /watchlist?user_id=xxx
router.get("/", WatchlistController.getUserWatchlist);
// POST /watchlist (body: user_id, product_id)
router.post("/", WatchlistController.addToWatchlist);
// DELETE /watchlist/:user_id/:product_id
router.delete("/:user_id/:product_id", WatchlistController.removeFromWatchlist);

export default router;
