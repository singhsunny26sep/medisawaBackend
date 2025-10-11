const mongoose = require("mongoose");
const TimeSlot = require("../model/TimeSlot");
const Doctor = require("../model/Doctor");
const { throwError } = require("../utils/CustomError");

const validateDate = (date) => {
  if (!date) throwError(422, "Date is required");
  const d = new Date(date);
  if (isNaN(d.getTime())) throwError(422, "Invalid date format");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  if (d < today) throwError(422, "Cannot create timeslot for past dates");
  return d;
};

exports.createTimeSlot = async (doctorId, data) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throwError(404, "Doctor not found");
  const { date, morning, afternoon, evening } = data;
  const slotDate = validateDate(date);
  const existing = await TimeSlot.findOne({
    doctorId,
    date: slotDate,
    isDeleted: false,
  });
  if (existing) throwError(409, "Time slot already exists for this date");
  const slot = await TimeSlot.create({
    userId: doctor?.userId,
    doctorId,
    date: slotDate,
    morning,
    afternoon,
    evening,
  });
  return slot;
};

exports.getAllTimeSlots = async (query) => {
  let {
    userId,
    doctorId,
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
  if (date) {
    const filterDate = new Date(date);
    const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
    matchStage.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (fromDate && toDate) {
    matchStage.date = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }
  const skip = (Number(page) - 1) * Number(limit);
  const sortStage = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "doctors",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $sort: sortStage },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];
  const result = await TimeSlot.aggregate(pipeline);
  const total = result[0]?.totalCount[0]?.count || 0;
  const timeSlots = result[0]?.data || [];
  if (total === 0) throwError(404, "No time slots found");
  return {
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    timeSlots,
  };
};

exports.getTimeSlotById = async (id) => {
  const slot = await TimeSlot.findOne({ _id: id, isDeleted: false }).populate(
    "doctorId userId"
  );
  if (!slot) throwError(404, "Time slot not found");
  return slot;
};

exports.updateTimeSlot = async (id, data) => {
  const slot = await TimeSlot.findOne({ _id: id, isDeleted: false });
  if (!slot) throwError(404, "Time slot not found");
  if (data.date) {
    const newDate = validateDate(data.date);
    const existing = await TimeSlot.findOne({
      _id: { $ne: id },
      doctorId: slot.doctorId,
      date: newDate,
      isDeleted: false,
    });
    if (existing) throwError(409, "Time slot already exists for this date");
    slot.date = newDate;
  }
  if (data.morning) slot.morning = { ...slot.morning, ...data.morning };
  if (data.afternoon) slot.afternoon = { ...slot.afternoon, ...data.afternoon };
  if (data.evening) slot.evening = { ...slot.evening, ...data.evening };
  await slot.save();
  return slot;
};

exports.deleteTimeSlot = async (id) => {
  const slot = await TimeSlot.findOne({ _id: id, isDeleted: false });
  if (!slot) throwError(404, "Time slot not found");
  slot.isDeleted = true;
  await slot.save();
};
