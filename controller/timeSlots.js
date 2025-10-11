const { sendSuccess, sendError } = require("../utils/response");
const timeSlotService = require("../service/timeSlotServices");

exports.createTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const result = await timeSlotService.createTimeSlot(doctorId, req.body);
    return sendSuccess(res, 201, "Time slot created successfully", result);
  } catch (error) {
    console.log("Error creating time slot:", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.getAllTimeSlots = async (req, res) => {
  try {
    const result = await timeSlotService.getAllTimeSlots(req.query);
    return sendSuccess(res, 200, "Time slots fetched successfully", result);
  } catch (error) {
    console.log("Error getting time slots:", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.getTimeSlotById = async (req, res) => {
  try {
    const result = await timeSlotService.getTimeSlotById(req.params.id);
    return sendSuccess(res, 200, "Time slot fetched successfully", result);
  } catch (error) {
    console.log("Error getting time slot:", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.updateTimeSlot = async (req, res) => {
  try {
    const result = await timeSlotService.updateTimeSlot(
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "Time slot updated successfully", result);
  } catch (error) {
    console.log("Error updating time slot:", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.deleteTimeSlot = async (req, res) => {
  try {
    await timeSlotService.deleteTimeSlot(req.params.id);
    return sendSuccess(res, 200, "Time slot deleted successfully");
  } catch (error) {
    console.log("Error deleting time slot:", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};
