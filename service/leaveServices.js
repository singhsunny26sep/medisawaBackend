const mongoose = require("mongoose");
const Leave = require("../model/Leave");
const Doctor = require("../model/Doctor");
const { throwError } = require("../utils/CustomError");

const validateLeaveDates = (startDate, endDate, allowPast = false) => {
  if (!startDate || !endDate) {
    throwError(422, "Start date and end date are required");
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throwError(422, "Invalid date format — must be a valid date");
  }
  if (start > end) {
    throwError(422, "Start date cannot be after end date");
  }
  if (!allowPast && end < today) {
    throwError(422, "Leave dates cannot be entirely in the past");
  }
  if (!allowPast && start < today) {
    throwError(422, "Start date cannot be before today");
  }
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    throwError(422, "Leave duration cannot exceed 90 days");
  }
  return { start, end, diffDays };
};

exports.createLeave = async (doctorId, data) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throwError(404, "Doctor not found");
  const { reason, startDate, endDate } = data;
  const { start, end, diffDays } = validateLeaveDates(startDate, endDate);
  const existing = await Leave.find({
    doctorId,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  if (existing.length > 0) {
    throwError(409, "Leave already exists for this date range");
  }
  const leave = await Leave.create({
    userId: doctor?.userId,
    doctorId: doctor?._id,
    reason,
    startDate: start,
    endDate: end,
    noOfDays: diffDays,
  });
  return leave;
};

exports.getAllLeaves = async (query) => {
  let {
    userId,
    doctorId,
    reason,
    date,
    fromDate,
    toDate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const matchStage = { isDeleted: { $ne: true } };
  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
  if (doctorId) matchStage.doctorId = new mongoose.Types.ObjectId(doctorId);
  if (reason) matchStage.reason = { $regex: reason, $options: "i" };
  if (date) {
    const filterDate = new Date(date);
    const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
    matchStage.$or = [
      {
        $and: [
          { startDate: { $lte: endOfDay } },
          { endDate: { $gte: startOfDay } },
        ],
      },
    ];
  }
  if (fromDate && toDate) {
    matchStage.startDate = { $gte: new Date(fromDate) };
    matchStage.endDate = { $lte: new Date(toDate) };
  }
  const skip = (Number(page) - 1) * Number(limit);
  const sortStage = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "doctors",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    { $sort: sortStage },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];
  const result = await Leave.aggregate(pipeline);
  const total = result[0]?.totalCount[0]?.count || 0;
  const leaves = result[0]?.data || [];
  if (total === 0) throwError(404, "No any leave found");
  return {
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    leaves,
  };
};

exports.getLeaveById = async (id) => {
  const leave = await Leave.findOne({ _id: id, isDeleted: false }).populate(
    "userId doctorId"
  );
  if (!leave) throwError(404, "Leave not found");
  return leave;
};

exports.updateLeave = async (leaveId, data) => {
  const leave = await Leave.findOne({ _id: id, isDeleted: false });
  if (!leave) throwError(404, "Leave not found");
  const { startDate, endDate, reason } = data;
  if (startDate && endDate) {
    const { start, end, diffDays } = validateLeaveDates(startDate, endDate);
    const existing = await Leave.find({
      _id: { $ne: leaveId },
      doctorId: leave?.doctorId,
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (existing.length > 0) {
      throwError(409, "Leave already exists for this date range");
    }
    leave.startDate = start;
    leave.endDate = end;
    leave.noOfDays = diffDays;
  }
  if (reason) leave.reason = reason;
  await leave.save();
  return leave;
};

exports.deleteLeave = async (id) => {
  const leave = await Leave.findOne({ _id: id, isDeleted: false });
  if (!leave) throwError(404, "Leave not found");
  leave.isDeleted = true;
  await leave.save();
  if (!leave) throwError(404, "Leave not found or already deleted");
};
