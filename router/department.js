const express = require("express");
const departRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getAllPagination,
} = require("../controller/department");

departRouter.get("/getAll", getDepartments);
departRouter.get("/get/:id", getDepartments);
departRouter.get("/pagination", getAllPagination);
departRouter.post("/add", verifyToken, addDepartment);
departRouter.put("/update/:id", verifyToken, updateDepartment);
departRouter.delete("/delete/:id", verifyToken, deleteDepartment);

module.exports = departRouter;
