const express = require("express");
const docRouter = express.Router();

const {
  addProfile,
  getAllDoctors,
  searchDoctorByCategoryOrbySpacailization,
  getDoctorProfile,
  addReceptOfPatient,
  addLabTest,
  topRatedDoctor,
  searchBySymptom,
} = require("../controller/doctor");
const { verifyToken } = require("../middleware/authValidation");

docRouter.get("/", getAllDoctors);
docRouter.get("/search/:id", searchDoctorByCategoryOrbySpacailization);
docRouter.get("/searchBySymptom", searchBySymptom);
docRouter.get("/getProfile", verifyToken, getDoctorProfile);
docRouter.get("/topRatedDoctor", topRatedDoctor);
docRouter.get("/:id", verifyToken, getAllDoctors); // get doctor by id
docRouter.post("/addProfile/:id", addProfile);
docRouter.post("/addReceipt", verifyToken, addReceptOfPatient);
docRouter.post("/addTests", verifyToken, addLabTest);

module.exports = docRouter;
