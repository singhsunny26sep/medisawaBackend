const mongoose = require("mongoose");
const Call = require("../model/Call");
const { throwError } = require("../utils/CustomError");

exports.getCallHistory = async (userId, filters, pagination) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const matchStage = {
    $or: [
      { caller: new mongoose.Types.ObjectId(userId) },
      { receiver: new mongoose.Types.ObjectId(userId) },
    ],
  };
  if (filters.callType) matchStage.callType = filters.callType;
  if (filters.callStatus) matchStage.callStatus = filters.callStatus;
  if (filters.isInCall !== undefined)
    matchStage.isInCall = filters.isInCall === "true";
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "caller",
        foreignField: "_id",
        as: "callerDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "_id",
        as: "receiverDetails",
      },
    },
    { $unwind: { path: "$callerDetails", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        callType: 1,
        callStatus: 1,
        callDuration: 1,
        isInCall: 1,
        callStartedAt: 1,
        callAcceptedAt: 1,
        callEndedAt: 1,
        caller: {
          _id: "$callerDetails._id",
          name: "$callerDetails.name",
          pic: "$callerDetails.pic",
        },
        receiver: {
          _id: "$receiverDetails._id",
          name: "$receiverDetails.name",
          pic: "$receiverDetails.pic",
        },
      },
    },
    { $sort: { callStartedAt: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $project: {
        data: 1,
        totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
      },
    },
  ];
  const result = await Call.aggregate(pipeline);
  const total = result[0]?.totalCount || 0;
  const data = result[0]?.data || [];
  if (total === 0) throwError(404, "No call logs found!");
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    calls: data,
  };
};
