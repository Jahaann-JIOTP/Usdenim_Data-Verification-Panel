import mongoose from "mongoose";

const ParameterSchema = new mongoose.Schema(
  {
    paramName: String,
    status: {
      type: String,
      enum: ["Verified", "Not Verified", "Not Sure", "Not Used"],
      default: "Not Verified",
    },
  },
  { _id: false }
);

const MeterSchema = new mongoose.Schema({
  name: String,
  location: String,
  parameters: [ParameterSchema],
  comments: [String],
});

export default mongoose.models.Meter || mongoose.model("Meter", MeterSchema);
