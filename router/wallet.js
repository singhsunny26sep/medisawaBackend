const express = require("express");
const walletRouter = express.Router();
const { verifyToken } = require("../middleware/authValidation");
const {
  getBalance,
  history,
  createRechargeOrder,
  verifyRecharge,
  payWithWallet,
} = require("../controller/wallet");

walletRouter.get("/balance", verifyToken, getBalance);
walletRouter.get("/history", verifyToken, history);
walletRouter.post("/recharge", verifyToken, createRechargeOrder);
walletRouter.post("/recharge/verify", verifyToken, verifyRecharge);
walletRouter.post("/pay", verifyToken, payWithWallet);

module.exports = walletRouter;
