const mongoose = require("mongoose");

const SpecializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    doctorCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Specialization", SpecializationSchema);
