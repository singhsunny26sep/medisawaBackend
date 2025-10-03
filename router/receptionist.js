const express = require("express");
const recepRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  getAllBooking,
  testPayment,
  addVitalOfPatient,
  paymentMultipleLabTest,
} = require("../controller/receptionist");

recepRouter.get("/booking", verifyToken, getAllBooking);
recepRouter.post("/labTestPyament/:id", verifyToken, testPayment); //labtestid
recepRouter.post("/paymentMultiLabTest", verifyToken, paymentMultipleLabTest);
recepRouter.post("/vitelPateint", verifyToken, addVitalOfPatient);

module.exports = recepRouter;
