const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    doctorCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Department", DepartmentSchema);
