const express = require("express");
const paymentRouter = express.Router();

const { placeOrder, verifyPayment } = require("../controller/payment");
const { verifyToken } = require("../middleware/authValidation");

paymentRouter.post("/generateOrder", verifyToken, placeOrder);
paymentRouter.post("/verifyPayment", verifyToken, verifyPayment);

module.exports = paymentRouter;
