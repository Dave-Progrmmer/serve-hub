import Service from "../models/service.js";

// @desc Create service
export const createService = async (req, res, next) => {
  try {
    const { title, description, category, price, location } = req.body;

    const service = await Service.create({
      provider: req.user._id,
      title,
      description,
      category,
      price,
      location,
      photos: req.file ? [req.file.path] : [],
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

// @desc Get all services
export const getServices = async (req, res, next) => {
  try {
    const filters = req.query.category ? { category: req.query.category } : {};
    const services = await Service.find(filters).populate("provider", "name email rating");
    res.json(services);
  } catch (err) {
    next(err);
  }
};

// @desc Get single service
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate("provider", "name email rating");
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

// @desc Update service
export const updateService = async (req, res, next) => {
  try {
    const updates = req.body;
    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

// @desc Delete service
export const deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    next(err);
  }
};
