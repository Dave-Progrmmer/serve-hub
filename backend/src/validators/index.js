import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("client", "provider").required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const serviceSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  location: Joi.object({
    address: Joi.string(),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
  }).optional(),
});

export const bookingSchema = Joi.object({
  service: Joi.string().required(),
  provider: Joi.string().required(),
  date: Joi.date().iso().min("now").required(),
  totalPrice: Joi.number().min(0).required(),
  notes: Joi.string().max(500).optional(),
});

export const reviewSchema = Joi.object({
  service: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    next();
  };
};