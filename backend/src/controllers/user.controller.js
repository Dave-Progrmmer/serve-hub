import User from "../models/user.js";

// @desc Get all users (optional: admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc Get single user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const updates = { ...req.body };
    
    // If there's a file upload, add it to updates
    if (req.file) {
      updates.profilePic = req.file.path; // Cloudinary URL
    }

    // Don't allow updating password or email through this route
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc Delete user
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};