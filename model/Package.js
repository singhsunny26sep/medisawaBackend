const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    image: {
      type: String,
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Package", PackageSchema);
