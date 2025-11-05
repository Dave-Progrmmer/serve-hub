import express from "express";
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  updateBookingStatus,
  cancelBooking 
} from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.js";
import { validate, bookingSchema } from "../validators/index.js";

const router = express.Router();

router.post("/", protect, validate(bookingSchema), createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/status", protect, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

export default router;