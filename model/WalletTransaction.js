const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true }, // rupees
    type: { type: String, enum: ["credit", "debit"], required: true },
    method: { type: String, enum: ["razorpay", "wallet"], default: "wallet" },
    purpose: { type: String }, // e.g., recharge, booking, medicine
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // optional link to Booking/Transaction/etc
    orderId: { type: String },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
