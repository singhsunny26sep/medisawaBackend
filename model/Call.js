const mongoose = require("mongoose");

const CallSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    callType: {
      type: String,
      enum: ["video", "audio"],
      default: "audio",
    },
    callStatus: {
      type: String,
      enum: ["ongoing", "accepted", "rejected", "ended"],
      default: "ongoing",
    },
    isInCall: { type: Boolean, default: true },
    callDuration: { type: Number, default: 0 }, //seconds
    callStartedAt: { type: Date, default: Date.now },
    callEndedAt: { type: Date },
    callAcceptedAt: { type: Date },
    callRejectedAt: { type: Date },
    callRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    callEndedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Call", CallSchema);
