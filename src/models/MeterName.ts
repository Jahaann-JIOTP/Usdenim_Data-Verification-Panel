import mongoose from "mongoose";

const MeterNameSchema = new mongoose.Schema({
  meter_name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "Not Available",
  },
  unique_key: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.models.meter_name ||
  mongoose.model("meter_name", MeterNameSchema, "meter_name");
