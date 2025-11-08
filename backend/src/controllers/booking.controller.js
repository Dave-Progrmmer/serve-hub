import Booking from "../models/booking.js";
import Service from "../models/service.js";
import User from "../models/user.js";
import dayjs from "dayjs";
import { sendPushNotification } from '../services/push.service.js';

export const createBooking = async (req, res, next) => {
  try {
    const { service, date, totalPrice, notes, provider: providerId } = req.body;
    
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found" });
    }

    const existingBooking = await Booking.findOne({
      provider: providerId,
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
      provider: providerId,
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

    // Send push notification to provider
    const provider = await User.findById(providerId);
    if (provider && provider.pushToken) {
      await sendPushNotification(
        provider.pushToken,
        'New Booking Request',
        `${req.user.name} wants to book ${serviceDoc.title}`,
        {
          type: 'booking',
          bookingId: booking._id,
        }
      );
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (err) {
    next(err);
  }
};

// Get all bookings for the logged-in user (client or provider)
export const getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filters = {
      $or: [
        { client: req.user._id },
        { provider: req.user._id }
      ]
    };

    if (status) {
      filters.status = status;
    }

    const bookings = await Booking.find(filters)
      .populate("client", "name email phone profilePic")
      .populate("provider", "name email phone profilePic")
      .populate("service", "title price category photos")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Booking.countDocuments(filters);

    res.json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    next(err);
  }
};

// Get single booking by ID
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("client", "name email phone profilePic")
      .populate("provider", "name email phone profilePic")
      .populate("service", "title description price category photos location");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = 
      booking.client._id.toString() === req.user._id.toString() ||
      booking.provider._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json({ success: true, data: booking });
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