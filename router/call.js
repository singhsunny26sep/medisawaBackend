const express = require("express");
const callRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  initiateCall,
  acceptCall,
  endCall,
  getCallHistory,
} = require("../controller/call");

callRouter.post("/initiate", verifyToken, initiateCall);
callRouter.put("/accept", verifyToken, acceptCall);
callRouter.post("/end", verifyToken, endCall);
callRouter.get("/get/history", verifyToken, getCallHistory);

module.exports = callRouter;
