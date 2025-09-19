const Razorpay = require("razorpay");
const User = require("../model/User");
const Transaction = require("../model/Transaction");
const { sendSingleNotification } = require("../service/notification");
const Booking = require("../model/Booking");
const Package = require("../model/Package");
const LabTest = require("../model/LabTest");
const { verifySignature } = require("../service/razorPay");
require("dotenv").config();

const razorPyaSecret = process.env.RAZOR_SECRET_KEY;
const instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_SECRET_KEY,
});

// exports.placeOrder = async (req, res) => {
//   const userId = req.payload?._id;
//   const amount = req.body?.amount;
//   const type = req.body?.type;
//   /* const bookingId = req.body?.bookingId
//     const medicineId = req.body?.medicineId
//     const testId = req.body?.testId
//     const packageId = req.body?.packageId */

//   try {
//     const checkUser = await User.findById(userId);
//     if (!checkUser) {
//       return res.status(404).json({ msg: "User not found!", success: false });
//     }
//     const options = {
//       amount: amount,
//       currency: "INR",
//       receipt: "receipt#1",
//       partial_payment: false,
//       notes: {
//         username: checkUser?.name,
//         email: checkUser?.email,
//       },
//     };

//     instance.orders.create(options, async (err, order) => {
//       // console.log("error: ", err);
//       // console.log("order: ", order);
//       if (err) {
//         return res
//           .status(401)
//           .json({ msg: "Failed to genarate payment order!", success: false });
//       }
//       const result = await Transaction.create({
//         userId,
//         amount,
//         type,
//         orderId: order.id,
//         payment: order.amount / 100,
//       });
//       // const result = await Transaction.create({ userId: id, studentId: studentId ? studentId : null, transactionType: "online", transaction_purpose: type, payment: (order.amount / 100), order_id: order.id, roles: role, transaction_id: genTransaction })

//       if (result) {
//         return res
//           .status(200)
//           .json({
//             msg: "Order created successfully.",
//             success: true,
//             result,
//             order,
//           });
//       }
//       return res
//         .status(400)
//         .json({ msg: "Failed to initiate payment!", success: false });
//     });
//   } catch (error) {
//     console.log("error on placeOrder: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

const { getCardPlanPrice } = require("../utils/getCardPricing");
const MembershipCard = require("../model/MemberShipCard");

exports.placeOrder = async (req, res) => {
  const userId = req.payload?._id;
  const { type, cardId, cardPlanType } = req.body;
  try {
    const checkUser = await User.findById(userId);
    if (!checkUser) {
      return res.status(404).json({ msg: "User not found!", success: false });
    }
    let amount = req.body?.amount;
    if (type === "card") {
      const card = await MembershipCard.findById(cardId);
      if (!card) {
        return res.status(404).json({ msg: "Card not found!", success: false });
      }
      const planPrice = getCardPlanPrice(cardPlanType);
      if (!planPrice) {
        return res
          .status(400)
          .json({ msg: "Invalid card plan type!", success: false });
      }
      amount = planPrice * 100;
    }
    const options = {
      amount,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        username: checkUser?.name,
        email: checkUser?.email,
      },
    };
    instance.orders.create(options, async (err, order) => {
      if (err) {
        return res
          .status(401)
          .json({ msg: "Failed to generate payment order!", success: false });
      }
      let purchaseDate, endDate;
      if (type === "card") {
        purchaseDate = new Date();
        if (cardPlanType === "quarterly") {
          endDate = new Date(
            purchaseDate.setMonth(purchaseDate.getMonth() + 3)
          );
        } else if (cardPlanType === "half-year") {
          endDate = new Date(
            purchaseDate.setMonth(purchaseDate.getMonth() + 6)
          );
        } else if (cardPlanType === "annual") {
          endDate = new Date(
            purchaseDate.setFullYear(purchaseDate.getFullYear() + 1)
          );
        }
      }
      const result = await Transaction.create({
        userId,
        amount,
        type,
        orderId: order.id,
        payment: order.amount / 100,
        ...(type === "card" && { cardId, cardPlanType, purchaseDate, endDate }),
      });
      if (result) {
        return res.status(200).json({
          msg: "Order created successfully.",
          success: true,
          result,
          order,
        });
      }
      return res
        .status(400)
        .json({ msg: "Failed to initiate payment!", success: false });
    });
  } catch (error) {
    console.log("error on placeOrder: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

// exports.verifyPayment = async (req, res) => {
//   // console.log("req.body: ", req.body);

//   const razorpay_signature = req.body.data.razorpay_signature;
//   const razorpay_order_id = req.body.data.razorpay_order_id;
//   const razorpay_payment_id = req.body.data.razorpay_payment_id;

//   const id = req.payload?._id;

//   // const bookingId = req.body?.bookingId
//   // const medicineId = req.body?.medicineId
//   // const testId = req.body?.testId
//   // const packageId = req.body?.packageId
//   const transationId = req.body?.transactionId;
//   const pay_amount = req.body.pay_amount;

//   const bookingId = req.body?.bookingId;
//   const medicineId = req.body?.medicineId;
//   const labTestId = req.body?.labTestId;
//   const packageId = req.body?.packageId;

//   try {
//     const isValid = verifySignature(
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       razorPyaSecret
//     );
//     if (!isValid) {
//       return res
//         .status(400)
//         .json({ msg: "Failed to verify payment!", success: false });
//     }

//     const checkUser = await User.findById(id);

//     const checkTransaction = await Transaction.findById(transationId);

//     if (bookingId) checkTransaction.bookingId = bookingId;
//     if (medicineId) checkTransaction.medicineId = medicineId;
//     if (labTestId) checkTransaction.labTestId = labTestId;
//     if (packageId) checkTransaction.packageId = packageId;

//     if (type == "booking") {
//   const checkBooking = await Booking.findbyId(bookingId);
//       if (!checkBooking) {
//         return res
//           .status(404)
//           .json({ msg: "Booking not found!", success: false });
//       }
//       // checkTransaction.bookingId = bookingId
//       checkBooking.bookingStatus = "confirmed";

//       checkBooking.save();
//     }

//     if (type == "package") {
//       const checkPackage = await Package.findbyId(packageId);
//       if (!checkPackage) {
//         return res
//           .status(404)
//           .json({ msg: "Package not found!", success: false });
//       }
//       checkPackage?.tests?.map(async (item) => {
//         await LabTest.findOneAndUpdate(
//           { test: item, patientId: checkUser?.patientId[0] },
//           { paid: true }
//         );
//       });
//     }

//     if (type == "labTest") {
//       await LabTest.findByIdAndUpdate(labTestId, { paid: true });
//     }
//     checkTransaction.paymentStatus = "paid";

//     const result = await checkTransaction.save();

//     if (result) {
//       let title = `Payment Confirmation`;
//       let body = `Hi ${checkUser?.name},your payment of ₹ ${pay_amount} for the B Safe service has been successfully processed. Thank you for your payment.`;

//       sendSingleNotification(id, title, body, null, "payment");

//       return res
//         .status(200)
//         .json({ msg: "Payment done successfully.", success: true });
//     }
//     return res
//       .status(401)
//       .json({ msg: "Faild to proceed payment!", success: false });
//   } catch (error) {
//     console.log("error on verifyPayment: ", error);
//     return res.status(500).json({ msg: error.message, error });
//   }
// };

exports.verifyPayment = async (req, res) => {
  const id = req.payload?._id;
  const razorpay_signature = req.body.data.razorpay_signature;
  const razorpay_order_id = req.body.data.razorpay_order_id;
  const razorpay_payment_id = req.body.data.razorpay_payment_id;
  const transationId = req.body?.transactionId;
  const pay_amount = req.body.pay_amount;
  const bookingId = req.body?.bookingId;
  const medicineId = req.body?.medicineId;
  const labTestId = req.body?.labTestId;
  const packageId = req.body?.packageId;
  try {
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorPyaSecret
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ msg: "Failed to verify payment!", success: false });
    }
    const checkUser = await User.findById(id);
    const checkTransaction = await Transaction.findById(transationId);
    if (!checkTransaction) {
      return res
        .status(404)
        .json({ msg: "Transaction not found!", success: false });
    }
    if (bookingId) checkTransaction.bookingId = bookingId;
    if (medicineId) checkTransaction.medicineId = medicineId;
    if (labTestId) checkTransaction.labTestId = labTestId;
    if (packageId) checkTransaction.packageId = packageId;
    const type = checkTransaction.type;
    if (type === "appoinment" && bookingId) {
      const checkBooking = await Booking.findById(bookingId);
      if (!checkBooking) {
        return res
          .status(404)
          .json({ msg: "Booking not found!", success: false });
      }
      checkBooking.bookingStatus = "confirmed";
      await checkBooking.save();
    }
    if (type === "package" && packageId) {
      const checkPackage = await Package.findById(packageId);
      if (!checkPackage) {
        return res
          .status(404)
          .json({ msg: "Package not found!", success: false });
      }
      for (const item of checkPackage?.tests || []) {
        await LabTest.findOneAndUpdate(
          { test: item, patientId: checkUser?.patientId[0] },
          { paid: true }
        );
      }
    }
    if (type === "labTest" && labTestId) {
      await LabTest.findByIdAndUpdate(labTestId, { paid: true });
    }
    if (type === "card") {
      const cardId = checkTransaction.cardId;
      const cardPlanType = checkTransaction.cardPlanType;
      if (!cardId || !cardPlanType) {
        return res.status(400).json({
          msg: "Invalid card purchase details!",
          success: false,
        });
      }
      if (!checkTransaction.purchaseDate || !checkTransaction.endDate) {
        const purchaseDate = new Date();
        let endDate;
        if (cardPlanType === "quarterly") {
          endDate = new Date(purchaseDate);
          endDate.setMonth(endDate.getMonth() + 3);
        } else if (cardPlanType === "half-year") {
          endDate = new Date(purchaseDate);
          endDate.setMonth(endDate.getMonth() + 6);
        } else if (cardPlanType === "annual") {
          endDate = new Date(purchaseDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        checkTransaction.purchaseDate = purchaseDate;
        checkTransaction.endDate = endDate;
      }
      //  checkUser.membership = { cardId, plan: cardPlanType, validTill: checkTransaction.endDate }
    }
    checkTransaction.paymentStatus = "paid";
    const result = await checkTransaction.save();
    if (result) {
      let title = `Payment Confirmation`;
      let body = `Hi ${checkUser?.name}, your payment of ₹${pay_amount} has been successfully processed. Thank you for your payment.`;
      sendSingleNotification(id, title, body, null, "payment");
      return res.status(200).json({
        msg: "Payment done successfully.",
        success: true,
        transaction: result,
      });
    }
    return res
      .status(401)
      .json({ msg: "Failed to proceed payment!", success: false });
  } catch (error) {
    console.log("error on verifyPayment: ", error);
    return res.status(500).json({ msg: error.message, error });
  }
};
