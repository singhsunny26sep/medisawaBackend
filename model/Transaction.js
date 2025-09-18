const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["test", "appoinment", "medicine", "package", "card"],
      default: "appoinment",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
    },
    labTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTest",
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipCard",
    },
    cardPlanType: {
      type: String,
      enum: ["quarterly", "half-year", "annual"],
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    payment: {
      type: String,
    },
    orderId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
