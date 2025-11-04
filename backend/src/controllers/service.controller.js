import Service from "../models/service.js";

export const createService = async (req, res, next) => {
  try {
    const { title, description, category, price, location } = req.body;

    const service = await Service.create({
      provider: req.user._id,
      title,
      description,
      category,
      price,
      location: location ? JSON.parse(location) : undefined,
      photos: req.files ? req.files.map(file => file.path) : [],
    });

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const services = await Service.find(filters)
      .populate("provider", "name email rating profilePic")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Service.countDocuments(filters);

    res.json({
      success: true,
      data: services,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    next(err);
  }
};

export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "name email rating profilePic phone bio location");
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await service.deleteOne();
    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    next(err);
  }
};