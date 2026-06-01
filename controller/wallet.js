const Razorpay = require("razorpay");
const User = require("../model/User");
const Wallet = require("../model/Wallet");
const WalletTransaction = require("../model/WalletTransaction");
const Transaction = require("../model/Transaction");
const { verifySignature } = require("../service/razorPay");
const { sendSingleNotification } = require("../service/notification");
const Booking = require("../model/Booking");
const LabTest = require("../model/LabTest");
const Package = require("../model/Package");
require("dotenv").config();

const razorPyaSecret = process.env.RAZOR_SECRET_KEY;
const instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_SECRET_KEY,
});

exports.getBalance = async (req, res) => {
  const userId = req.payload?._id;
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }
    return res.status(200).json({ success: true, wallet });
  } catch (error) {
    console.log("error on getBalance: ", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.history = async (req, res) => {
  const userId = req.payload?._id;
  try {
    const history = await WalletTransaction.find({ userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.log("error on wallet history: ", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// Create razorpay order for wallet recharge
exports.createRechargeOrder = async (req, res) => {
  const userId = req.payload?._id;
  const { amount } = req.body; // amount in rupees
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, msg: "Invalid amount" });
  }
  try {
    const checkUser = await User.findById(userId);
    if (!checkUser)
      return res.status(404).json({ msg: "User not found", success: false });

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `wallet_recharge_${userId}_${Date.now()}`,
      partial_payment: false,
      notes: { username: checkUser.name, email: checkUser.email },
    };
    instance.orders.create(options, async (err, order) => {
      if (err) {
        console.log("razor order err: ", err);
        return res
          .status(500)
          .json({ success: false, msg: "Failed to create order" });
      }
      const trx = await Transaction.create({
        userId,
        amount: options.amount,
        type: "wallet",
        orderId: order.id,
        payment: options.amount / 100,
        paymentStatus: "pending",
      });
      await WalletTransaction.create({
        userId,
        amount,
        type: "credit",
        method: "razorpay",
        purpose: "recharge",
        orderId: order.id,
        status: "pending",
      });
      return res.status(200).json({ success: true, order, transaction: trx });
    });
  } catch (error) {
    console.log("error on createRechargeOrder: ", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// Verify razorpay recharge and credit wallet
exports.verifyRecharge = async (req, res) => {
  const userId = req.payload?._id;
  const razorpay_signature = req.body.data.razorpay_signature;
  const razorpay_order_id = req.body.data.razorpay_order_id;
  const razorpay_payment_id = req.body.data.razorpay_payment_id;
  const transactionId = req.body?.transactionId; // Transaction _id
  const pay_amount = req.body.pay_amount; // rupees

  try {
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorPyaSecret,
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ msg: "Failed to verify payment!", success: false });
    }
    const trx = await Transaction.findById(transactionId);
    if (!trx)
      return res
        .status(404)
        .json({ msg: "Transaction not found", success: false });

    trx.paymentStatus = "paid";
    await trx.save();

    // credit wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });
    wallet.balance = Number((wallet.balance || 0) + Number(pay_amount));
    await wallet.save();

    // update wallet transaction record
    await WalletTransaction.findOneAndUpdate(
      { orderId: razorpay_order_id, userId },
      { paymentId: razorpay_payment_id, status: "success" },
      { new: true },
    );

    let title = `Wallet Recharge Successful`;
    let body = `Hi, your wallet has been credited with ₹${pay_amount}.`;
    sendSingleNotification(userId, title, body, null, "wallet");

    return res.status(200).json({ success: true, wallet });
  } catch (error) {
    console.log("error on verifyRecharge: ", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// Pay using wallet (full or partial)
exports.payWithWallet = async (req, res) => {
  const userId = req.payload?._id;
  let { amount, type } = req.body; // amount in rupees
  const bookingId = req.body?.bookingId;
  const medicineId = req.body?.medicineId;
  const labTestId = req.body?.labTestId;
  const packageId = req.body?.packageId;

  if (!amount || amount <= 0)
    return res.status(400).json({ success: false, msg: "Invalid amount" });
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    const available = Number(wallet.balance || 0);
    if (available >= amount) {
      // full payment from wallet
      wallet.balance = Number((available - amount).toFixed(2));
      await wallet.save();
      await WalletTransaction.create({
        userId,
        amount,
        type: "debit",
        method: "wallet",
        purpose: type || "payment",
        status: "success",
        referenceId: bookingId || medicineId || labTestId || packageId,
      });
      const trx = await Transaction.create({
        userId,
        amount: Math.round(amount * 100),
        type: type || "appoinment",
        paymentStatus: "paid",
        payment: amount,
        ...(bookingId && { bookingId }),
        ...(medicineId && { medicineId }),
        ...(labTestId && { labTestId }),
        ...(packageId && { packageId }),
      });

      // perform post-payment actions similar to verifyPayment
      if (
        type === "appoinment" ||
        type === "appoinment" ||
        type === "booking"
      ) {
        if (bookingId) {
          const checkBooking = await Booking.findById(bookingId);
          if (checkBooking) {
            checkBooking.bookingStatus = "confirmed";
            await checkBooking.save();
          }
        }
      }
      if (type === "package" && packageId) {
        const checkPackage = await Package.findById(packageId);
        if (checkPackage) {
          for (const item of checkPackage?.tests || []) {
            await LabTest.findOneAndUpdate(
              { test: item, patientId: req.payload?.patientId?.[0] },
              { paid: true },
            );
          }
        }
      }
      if (type === "labTest" && labTestId) {
        await LabTest.findByIdAndUpdate(labTestId, { paid: true });
      }

      sendSingleNotification(
        userId,
        "Payment Success",
        `₹${amount} has been deducted from your wallet.`,
        null,
        "payment",
      );

      return res.status(200).json({
        success: true,
        msg: "Payment completed using wallet.",
        transaction: trx,
        wallet,
      });
    }

    // partial payment: deduct available and create razorpay order for remaining
    const deducted = available;
    if (deducted > 0) {
      wallet.balance = 0;
      await wallet.save();
      await WalletTransaction.create({
        userId,
        amount: deducted,
        type: "debit",
        method: "wallet",
        purpose: type || "payment",
        status: "success",
        referenceId: bookingId || medicineId || labTestId || packageId,
      });
    }

    const remaining = Number((amount - deducted).toFixed(2));
    // create razorpay order for remaining
    const options = {
      amount: Math.round(remaining * 100),
      currency: "INR",
      receipt: `wallet_partial_${userId}_${Date.now()}`,
      partial_payment: false,
      notes: { username: req.payload?.name, email: req.payload?.email },
    };
    instance.orders.create(options, async (err, order) => {
      if (err) {
        console.log("err on create order for remaining: ", err);
        return res
          .status(500)
          .json({ success: false, msg: "Failed to generate payment order" });
      }
      const trx = await Transaction.create({
        userId,
        amount: options.amount,
        type: type || "appoinment",
        orderId: order.id,
        payment: options.amount / 100,
        paymentStatus: "pending",
        ...(bookingId && { bookingId }),
        ...(medicineId && { medicineId }),
        ...(labTestId && { labTestId }),
        ...(packageId && { packageId }),
      });
      return res.status(200).json({
        success: true,
        msg: "Partial wallet used; pay remaining via gateway.",
        order,
        transaction: trx,
        deducted,
      });
    });
  } catch (error) {
    console.log("error on payWithWallet: ", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
