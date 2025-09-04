const express = require('express')
const { placeOrder, verifyPayment } = require('../controller/payment')
const { verifyToken } = require('../middleware/authValidation')
const paymentRouter = express.Router()

paymentRouter.post('/generateOrder', verifyToken, placeOrder)

paymentRouter.post('/verifyPayment', verifyToken, verifyPayment)

module.exports = paymentRouter