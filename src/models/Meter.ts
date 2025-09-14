import mongoose, { Schema } from "mongoose";

const ParameterSchema = new Schema({
  paramName: { type: String, required: true },
  status: {
    type: String,
    enum: ["Verified", "Not Verified", "Not Sure", "Not Used"],
    default: "Not Verified",
  },
  updatedAt: { type: Date, default: Date.now }, // New field for per-parameter update
});

const MeterSchema = new Schema(
  {
    unique_key: { type: String, required: true, unique: true },
    parameters: [ParameterSchema],
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Meter || mongoose.model("Meter", MeterSchema);
