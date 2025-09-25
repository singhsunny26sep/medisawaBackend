const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
    },
    pin: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true, versionKey: false }
);

LocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Location", LocationSchema);
