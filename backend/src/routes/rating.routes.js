import express from "express";
import RatingController from "../controllers/rating.controller.js";

const router = express.Router();

router.post("/", RatingController.addRating);
router.get("/:user_id", RatingController.getUserRatings);
router.get("/:user_id/score", RatingController.getUserScoreCount);
router.get("/:user_id/eligibility", RatingController.getUserRatingEligibility);

export default router;
