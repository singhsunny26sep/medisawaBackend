const express = require('express');
const { addProfilePatient } = require('../controller/patient');
const patientRouter = express.Router();

patientRouter.post('/addProfile/:id', addProfilePatient)

module.exports = patientRouter