const mongoose = require("mongoose");

const EnquerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Enquery", EnquerSchema);
