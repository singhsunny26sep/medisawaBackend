const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    morning: {
      at9AM: { type: Boolean },
      at9_30AM: { type: Boolean },
      at10AM: { type: Boolean },
      at10_30AM: { type: Boolean },
    },
    afternoon: {
      at2PM: { type: Boolean },
      at2_30PM: { type: Boolean },
      at3PM: { type: Boolean },
    },
    evening: {
      at4PM: { type: Boolean },
      at4_30PM: { type: Boolean },
      at5PM: { type: Boolean },
      at5_30PM: { type: Boolean },
    },
    date: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Time", TimeSlotSchema);
