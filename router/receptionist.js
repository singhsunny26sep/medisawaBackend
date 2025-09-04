const express = require('express')
const { verifyToken } = require('../middleware/authValidation')
const { getAllBooking, testPayment, addVitalOfPatient, paymentMultipleLabTest } = require('../controller/receptionist')
const recepRouter = express.Router()

recepRouter.get('/booking', verifyToken, getAllBooking)

recepRouter.post('/labTestPyament/:id', verifyToken, testPayment) //labtestid

recepRouter.post('/paymentMultiLabTest', verifyToken, paymentMultipleLabTest)

recepRouter.post('/vitelPateint', verifyToken, addVitalOfPatient)

module.exports = recepRouter