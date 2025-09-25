const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
    },
    image: {
      type: String,
    },
    type: {
      type: String,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Image", ImageSchema);
