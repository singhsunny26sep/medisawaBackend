const express = require("express");
const router = express.Router();

const leaveController = require("../controller/leave");
const { verifyToken } = require("../middleware/authValidation");

router.post("/create/:doctorId", verifyToken, leaveController.createLeave);
router.get("/getAll", verifyToken, leaveController.getAllLeaves);
router.get("/get/:id", verifyToken, leaveController.getLeaveById);
router.put("/update/:id", verifyToken, leaveController.updateLeave);
router.delete("/delete/:id", verifyToken, leaveController.deleteLeave);

module.exports = router;
