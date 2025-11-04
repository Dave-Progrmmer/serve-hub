import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  photos: [String],
  location: {
    address: String,
    lat: Number,
    lng: Number,
  },
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
