import express from "express";
import RatingController from "../controllers/rating.controller.js";

const router = express.Router();

router.post("/", RatingController.addRating);
router.get("/:user_id", RatingController.getUserRatings);
router.get("/:user_id/score", RatingController.getUserScoreCount);

export default router;
