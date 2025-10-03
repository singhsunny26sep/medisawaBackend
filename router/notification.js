const express = require("express");
const notifyRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const { getAllNotificationsPagination } = require("../controller/notification");

notifyRouter.get("/getAll", verifyToken, getAllNotificationsPagination);

module.exports = notifyRouter;
