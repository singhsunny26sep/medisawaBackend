const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const timeSlotController = require("../controller/timeSlots");

router.post(
  "/create/:doctorId",
  verifyToken,
  timeSlotController.createTimeSlot
);
router.get("/getAll", verifyToken, timeSlotController.getAllTimeSlots);
router.get("/get/:id", verifyToken, timeSlotController.getTimeSlotById);
router.put("/update/:id", verifyToken, timeSlotController.updateTimeSlot);
router.delete("/delete/:id", verifyToken, timeSlotController.deleteTimeSlot);

module.exports = router;
