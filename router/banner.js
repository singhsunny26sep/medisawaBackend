const express = require("express");
const bannerRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  getAllBanner,
  addBanner,
  updateBanner,
  deleteBanner,
  getAllWithPagination,
} = require("../controller/banner");

bannerRouter.get("/getAll", getAllBanner);
bannerRouter.get("/getOne/:id", getAllBanner);
bannerRouter.get("/pagination", getAllWithPagination);
bannerRouter.post("/add", /* verifyToken, */ addBanner);
bannerRouter.put("/update/:id", /* verifyToken, */ updateBanner);
bannerRouter.delete("/delete/:id", /* verifyToken, */ deleteBanner);

module.exports = bannerRouter;
