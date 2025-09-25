const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model("Brand", BrandSchema);
