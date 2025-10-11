const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    morning: {
      at9AM: { type: Boolean, default: false },
      at9_30AM: { type: Boolean, default: false },
      at10AM: { type: Boolean, default: false },
      at10_30AM: { type: Boolean, default: false },
    },
    afternoon: {
      at2PM: { type: Boolean, default: false },
      at2_30PM: { type: Boolean, default: false },
      at3PM: { type: Boolean, default: false },
    },
    evening: {
      at4PM: { type: Boolean, default: false },
      at4_30PM: { type: Boolean, default: false },
      at5PM: { type: Boolean, default: false },
      at5_30PM: { type: Boolean, default: false },
    },
    date: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
