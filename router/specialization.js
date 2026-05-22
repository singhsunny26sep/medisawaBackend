const express = require("express");
const specialRouter = express.Router();

const {
  getSpecialization,
  addSpecialization,
  updateSpecialization,
  deleteSpecialization,
  getAllSpecializationPagination,
} = require("../controller/specialization");
const { verifyToken } = require("../middleware/authValidation");

specialRouter.get("/getAll", getSpecialization);
specialRouter.get("/get/:id", getSpecialization);
specialRouter.get("/pagination", getAllSpecializationPagination);
specialRouter.post("/add", verifyToken, addSpecialization);
specialRouter.put("/update/:id", verifyToken, updateSpecialization);
specialRouter.delete("/delete/:id", verifyToken, deleteSpecialization);

module.exports = specialRouter;
