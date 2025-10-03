const express = require("express");
const labRouter = express.Router();

const {
  getAllTests,
  getTestByLab,
  addTest,
  updateTest,
  deleteTest,
  getByBookingId,
  getByPatientId,
  getByDoctorId,
  getTestLabPatient,
  getByLabId,
  uploadReport,
  updateReport,
  deleteReport,
  mostTakenTest,
  getPatientList,
  bookTest,
} = require("../controller/Lab");
const { verifyToken } = require("../middleware/authValidation");

labRouter.get("/", getAllTests);
labRouter.get("/single/:id", getAllTests);
labRouter.get("/topMustLab", mostTakenTest);
labRouter.get("/patientList", verifyToken, getPatientList);
labRouter.get("/getByLabId/:id", verifyToken, getTestByLab);
labRouter.post("/add", verifyToken, addTest);
labRouter.put("/update/:id", verifyToken, updateTest);
labRouter.get("/testList", verifyToken, getTestLabPatient);
labRouter.delete("/delete/:id", verifyToken, deleteTest);
labRouter.get("/getByAppoinmentId/:id", verifyToken, getByBookingId);
labRouter.get("/getByPatientId/:id", verifyToken, getByPatientId);
labRouter.get("/getByDoctorId/:id", verifyToken, getByDoctorId);
labRouter.get("/getTestList/:id", verifyToken, getByLabId);
labRouter.post("/uploadReport/:id", verifyToken, uploadReport); //labtest id
labRouter.put("/updateReport/:id", verifyToken, updateReport); //report id
labRouter.delete("/deleteReport/:id", verifyToken, deleteReport); //report id
// ============================== book test by user in web app ================================
labRouter.post("/book/:id", verifyToken, bookTest);

module.exports = labRouter;
