const mongoose = require("mongoose");

const SellSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      enum: ["cart", "normal"],
      default: "normal",
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
    },
    sizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
    },
    quantity: Number,
    priceAtSale: Number,
    amount: Number,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Sell", SellSchema);
