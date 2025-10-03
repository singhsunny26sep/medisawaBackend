const express = require("express");
const medicineCartRouter = express.Router();

const {
  getMyCart,
  addToMedicineCart,
  removeFromMedicineCart,
  updateMedicineCart,
} = require("../controller/medicineCart");
const { verifyToken } = require("../middleware/authValidation");

medicineCartRouter.get("/getCart", verifyToken, getMyCart);
medicineCartRouter.post("/addToCart", verifyToken, addToMedicineCart);
medicineCartRouter.put("/updateToCart", verifyToken, updateMedicineCart);
medicineCartRouter.delete(
  "/removeFromCart/:id",
  verifyToken,
  removeFromMedicineCart
);

module.exports = medicineCartRouter;
