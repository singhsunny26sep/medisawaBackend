const express = require("express");
const planRouter = express.Router();

const {
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
} = require("../controller/plan");
const { verifyToken } = require("../middleware/authValidation");

planRouter.get("/", getPlans);
planRouter.get("/:id", getPlans);
planRouter.post("/add", verifyToken, addPlan);
planRouter.put("/:id", verifyToken, updatePlan);
planRouter.delete("/:id", verifyToken, deletePlan);

module.exports = planRouter;
