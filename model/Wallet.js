const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 }, // balance in rupees
    currency: { type: String, default: "INR" },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Wallet", WalletSchema);
