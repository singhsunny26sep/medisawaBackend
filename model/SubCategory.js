const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema(
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("SubCategory", SubCategorySchema);
