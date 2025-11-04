import Review from "../models/review.js";
import Service from "../models/service.js";

// @desc Add review
export const createReview = async (req, res, next) => {
  try {
    const { service, rating, comment } = req.body;

    const review = await Review.create({
      client: req.user._id,
      service,
      rating,
      comment,
    });

    // Optionally update average rating on Service
    const reviews = await Review.find({ service });
    const avgRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await Service.findByIdAndUpdate(service, { rating: avgRating });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// @desc Get service reviews
export const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("client", "name");
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
