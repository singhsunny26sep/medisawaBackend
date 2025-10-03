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

departRouter.get("/", /* verifyToken, */ getDepartments);
departRouter.get("/:id", verifyToken, getDepartments);
departRouter.get("/pagination/limit", verifyToken, getAllPagination);
departRouter.post("/", verifyToken, addDepartment);
departRouter.put("/:id", verifyToken, updateDepartment);
departRouter.delete("/:id", verifyToken, deleteDepartment);

module.exports = departRouter;
