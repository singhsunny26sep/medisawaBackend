const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    reason: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    noOfDays: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Leave", LeaveSchema);
