import Booking from "../models/booking.js";
import Service from "../models/service.js";
import dayjs from "dayjs";

export const createBooking = async (req, res, next) => {
  try {
    const { service, date, totalPrice, notes, provider } = req.body;

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found" });
    }

    const existingBooking = await Booking.findOne({
      provider,
      date: {
        $gte: dayjs(date).startOf("day").toDate(),
        $lte: dayjs(date).endOf("day").toDate(),
      },
      status: { $in: ["pending", "accepted"] }
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: "Provider is already booked for this date" 
      });
    }

    const booking = await Booking.create({
      client: req.user._id,
      provider,
      service,
      date,
      totalPrice,
      notes,
    });

    const populatedBooking = await booking.populate([
      { path: "client", select: "name email phone" },
      { path: "provider", select: "name email phone" },
      { path: "service", select: "title price category" }
    ]);

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("client provider service");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only provider can update booking status" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const canCancel = 
      booking.client.toString() === req.user._id.toString() ||
      booking.provider.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};