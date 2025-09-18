const mongoose = require("mongoose");

const membershipCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["basic", "family", "premium", "platinum"],
      required: true,
    },
    planType: {
      type: String,
      enum: ["quarterly", "half-year", "annual"],
    },
    price: { type: Number, required: true },
    validThru: { type: String },
    description: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("MembershipCard", membershipCardSchema);
