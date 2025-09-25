const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    size: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
      },
    ],
    unit: {
      type: String,
    },
    price: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    manufacturer: {
      type: String,
    },
    quntity: {
      type: Number,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    isOffer: {
      type: Boolean,
      default: false,
    },
    offer: {
      type: Number,
    },
    offerType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model("Medicine", MedicineSchema);
