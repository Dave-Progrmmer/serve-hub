import express from "express";
import { createBooking, getBookings, getBooking, updateBookingStatus } from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/status", protect, updateBookingStatus);

export default router;
