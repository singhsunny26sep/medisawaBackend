const { sendSuccess, sendError } = require("../utils/response");
const leaveService = require("../service/leaveServices");

exports.createLeave = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const result = await leaveService.createLeave(doctorId, req.body);
    return sendSuccess(res, 201, "Leave created successfully", result);
  } catch (error) {
    console.log("error on creating leave", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const result = await leaveService.getAllLeaves(req.query);
    return sendSuccess(res, 200, "Leaves fetched successfully", result);
  } catch (error) {
    console.log("error on getting leave", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const result = await leaveService.getLeaveById(req.params.id);
    return sendSuccess(res, 200, "Leave fetched successfully", result);
  } catch (error) {
    console.log("error on get leave", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const result = await leaveService.updateLeave(req.params.id, req.body);
    return sendSuccess(res, 200, "Leave updated successfully", result);
  } catch (error) {
    console.log("error on updating leave", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    await leaveService.deleteLeave(req.params.id);
    return sendSuccess(res, 200, "Leave deleted successfully");
  } catch (error) {
    console.log("error on deleting leave", error);
    return sendError(res, error.statusCode || 500, error.message);
  }
};
