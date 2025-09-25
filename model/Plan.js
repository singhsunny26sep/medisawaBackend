const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    planType: {
      type: String,
    },
    planCost: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Plan", PlanSchema);
