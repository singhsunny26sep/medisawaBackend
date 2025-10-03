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

specialRouter.get("/", /* verifyToken, */ getSpecialization);
specialRouter.get("/:id", verifyToken, getSpecialization);
specialRouter.get(
  "/pagination/limit",
  verifyToken,
  getAllSpecializationPagination
);
specialRouter.post("/", verifyToken, addSpecialization);
specialRouter.put("/:id", verifyToken, updateSpecialization);
specialRouter.delete("/:id", verifyToken, deleteSpecialization);

module.exports = specialRouter;
