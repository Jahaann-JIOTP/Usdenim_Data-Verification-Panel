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

const MeterSchema = new mongoose.Schema(
  {
    unique_key: { type: String, required: true },
    name: String,
    location: String,
    parameters: [ParameterSchema],
    comment: { type: String, default: "" },

    commentUpdatedAt: { type: Date },
    statusUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Meter ||
  mongoose.model("Meter", MeterSchema, "meters");