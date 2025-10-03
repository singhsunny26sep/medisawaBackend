const express = require("express");
const categoryRouter = express.Router();

const {
  getAllCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllWithPagination,
  getSubacategory,
} = require("../controller/Category");
const { verifyToken } = require("../middleware/authValidation");

categoryRouter.get("/getAll", getAllCategory);
categoryRouter.get("/getOne/:id", getAllCategory);
categoryRouter.get("/pagination", getAllWithPagination);
categoryRouter.get("/categoryWithSubscategories", getSubacategory);
categoryRouter.post("/add", /* verifyToken, */ addCategory);
categoryRouter.put("/update/:id", /* verifyToken, */ updateCategory);
categoryRouter.delete("/delete/:id", /* verifyToken, */ deleteCategory);

module.exports = categoryRouter;
