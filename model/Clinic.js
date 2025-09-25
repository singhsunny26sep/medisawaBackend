const mongoose = require("mongoose");

const ClinicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    openTime: {
      type: String,
    },
    closeTime: {
      type: String,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

ClinicSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Clinic", ClinicSchema);
