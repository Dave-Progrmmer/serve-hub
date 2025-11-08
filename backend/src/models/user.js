import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "provider"], required: true },
  phone: String,
  bio: String,
  location: {
    address: String,
    lat: Number,
    lng: Number,
  },
  profilePic: String,
  rating: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  pushToken: String, // For push notifications
}, { timestamps: true });

export default mongoose.model("User", userSchema);