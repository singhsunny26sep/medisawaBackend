const express = require("express");
const dashboardRouter = express.Router();

const { dashobard } = require("../controller/dashobard");

dashboardRouter.get("/", dashobard);

module.exports = dashboardRouter;
