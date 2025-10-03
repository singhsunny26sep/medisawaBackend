const express = require("express");
const brandRouter = express.Router();

const {
  getAllBrand,
  addBrand,
  updateBrand,
  deleteBrand,
  getAllWithPagination,
} = require("../controller/brand");

brandRouter.get("/getAll", getAllBrand);
brandRouter.get("/getOne/:id", getAllBrand);
brandRouter.get("/pagination", getAllWithPagination);
brandRouter.post("/add", /* verifyToken, */ addBrand);
brandRouter.put("/update/:id", /* verifyToken, */ updateBrand);
brandRouter.delete("/delete/:id", /* verifyToken, */ deleteBrand);

module.exports = brandRouter;
