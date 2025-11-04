import Booking from "../models/booking.js";

// @desc Create booking
export const createBooking = async (req, res, next) => {
  try {
    const { service, date, totalPrice, notes, provider } = req.body;

    const booking = await Booking.create({
      client: req.user._id,
      provider,
      service,
      date,
      totalPrice,
      notes,
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// @desc Get user bookings
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user._id }, { provider: req.user._id }],
    })
      .populate("client", "name email")
      .populate("provider", "name email")
      .populate("service", "title");

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// @desc Get single booking
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("client provider service");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// @desc Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
