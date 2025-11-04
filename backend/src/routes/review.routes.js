import express from "express";
import { createReview, getServiceReviews } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/:serviceId", getServiceReviews);

export default router;
