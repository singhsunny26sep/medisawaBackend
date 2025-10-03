const express = require("express");
const cartRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  getAllCartData,
  addToCart,
  removeFromCart,
} = require("../controller/cart");

cartRouter.get("/", verifyToken, getAllCartData);
cartRouter.post("/:id", verifyToken, addToCart);
// cartRouter.delete('/remove/:id', verifyToken, removeFromCart)
cartRouter.delete("/remove/:id", verifyToken, addToCart);

module.exports = cartRouter;
