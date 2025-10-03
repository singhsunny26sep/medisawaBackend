const express = require("express");
const patientRouter = express.Router();

const { addProfilePatient } = require("../controller/patient");

patientRouter.post("/addProfile/:id", addProfilePatient);

module.exports = patientRouter;
