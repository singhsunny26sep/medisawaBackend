// const vcxroom = require("../enableX/vcxroom");
const { v4: uuidv4 } = require("uuid");
const { generateAgoraToken, generateRtmToken } = require("../agora/agoraToken");
const Call = require("../model/Call");
const User = require("../model/User");
const { sendSingleNotification } = require("../service/notification");
const { sendSuccess, sendError } = require("../utils/response");
const callService = require("../service/callService");

// const creatToken = async (body) => {
//   try {
//     return new Promise((resolve, reject) => {
//       vcxroom.getToken(body, (status, data) => {
//         if (status && data) {
//           resolve(data);
//         } else {
//           reject(new Error("Failed to get token"));
//         }
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error fetching token");
//   }
// };

// const creatRoomId = async () => {
//   const newRoomObjec = {
//     name: "Demo Room",
//     settings: {
//       description: `Voice-Calling`,
//       scheduled: false,
//       participants: "10",
//       duration: "90",
//       active_talker: true,
//       auto_recording: false,
//       adhoc: true,
//       mode: "group",
//       moderators: "4",
//       quality: "SD",
//       media_zone: "IN",
//       knock: false,
//       canvas: true,
//       max_active_talkers: "6",
//       screen_share: true,
//       // audio_only: condition, //for true only audio and false so video
//       abwd: true,
//     },
//     sip: {
//       enabled: false,
//     },
//     data: {
//       name: "Demo",
//     },
//     owner_ref: "Demo",
//   };

//   try {
//     return new Promise((resolve, reject) => {
//       vcxroom.createRoom(newRoomObjec, (status, data) => {
//         if (status && data?.room?.room_id) {
//           resolve(data?.room?.room_id);
//         } else {
//           reject(new Error("Failed to create room"));
//         }
//       });
//     });
//   } catch (error) {
//     console.log("error on creatRoomId: ", error);
//     // console.error(error);
//     res.status(500).json({ success: false, message: "Error creating room" });
//   }
// };

exports.initiateCall = async (req, res) => {
  const userId = req.payload?._id;
  // console.log("req.body: ", req.body);
  const recieverId = req.body?.recieverId;
  const callType = req.body?.callType;
  try {
    // Validate call type
    if (!["video", "audio"].includes(callType)) {
      return res.status(400).json({
        success: false,
        message: "Call type must be either video or audio",
      });
    }
    const checkReciever = await User.findById(recieverId);
    // console.log("checkReciever: ", checkReciever);
    if (!checkReciever) {
      return res
        .status(400)
        .json({ success: false, message: "Reciever not found" });
    }
    const checkCaller = await User.findById(userId);
    if (!checkCaller) {
      return res
        .status(400)
        .json({ success: false, message: "Caller not found" });
    }
    const checkSelfFree = await Call.findOne({
      $or: [{ caller: userId }, { receiver: userId }],
      callStatus: "ongoing",
    });
    if (checkSelfFree) {
      return res
        .status(400)
        .json({ success: false, message: "You are already in a call." });
    }
    const checkFree = await Call.findOne({
      $or: [{ caller: recieverId }, { receiver: recieverId }],
      callStatus: "ongoing",
    });
    if (checkFree) {
      return res.status(400).json({
        success: false,
        message: `${checkCaller.name} is already in a call.`,
      });
    }
    const channelName = `call_${uuidv4()}`;
    const uid = userId;
    const rtcToken = generateAgoraToken(channelName, uid);
    const callerRtmToken = generateRtmToken(userId.toString());
    const receiverRtmToken = generateRtmToken(recieverId.toString());
    const result = await Call.create({
      caller: userId,
      receiver: recieverId,
      callType,
      callStatus: "ongoing",
    });
    //const roomId = await creatRoomId();
    // const data = {
    //   name: checkCaller?.name || "Guest",
    //   role: "moderator",
    //   user_ref: checkCaller?._id?.toString(),
    //   roomId: roomId,
    // };
    // const title = `Incoming ${callType} Call`;
    // const message = `${checkCaller?.name || "Someone"} is calling you`;
    // await sendSingleNotification(recieverId, title, message, userId, "call");
    // const token = await creatToken({ room_id: roomId });
    // const token = await creatToken(data);
    return res.status(200).json({
      success: true,
      message: "Call initiated successfully",
      data: {
        callId: result?._id,
        callType,
        channelName,
        uid,
        callerRtmToken,
        receiverRtmToken,
        // roomId,
        receiver: { name: checkReciever?.name, role: checkReciever.role },
        rtcToken,
      },
    });
  } catch (error) {
    console.log("error on initiateCall: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.acceptCall = async (req, res) => {
  const receiverId = req.payload?._id;
  // const receiverId = req.body?.receiverId
  // const roomId = req.body?.roomId;
  const callId = req.body?.callId;
  try {
    const checkCall = await Call.findById(callId);
    if (!checkCall) {
      return res
        .status(400)
        .json({ success: false, message: "Call not found" });
    }
    if (checkCall.isInCall == false) {
      return res
        .status(400)
        .json({ success: false, message: "Call has ended" });
    }
    if (checkCall.callStatus != "ongoing") {
      return res
        .status(400)
        .json({ success: false, message: "Call is not ongoing" });
    }
    checkCall.callStatus = "accepted";
    checkCall.callAcceptedAt = new Date();
    await checkCall.save();
    // const data = {
    //   name: req.payload.name || "Guest",
    //   role: "moderator",
    //   user_ref: receiverId?.toString(),
    //   roomId: roomId,
    // };
    // const token = await creatToken(data);
    return res
      .status(200)
      .json({ success: true, data: { callId: checkCall?._id } });
  } catch (error) {
    console.log("error on acceptCall: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.endCall = async (req, res) => {
  const callId = req.body?.callId;
  const userId = req.payload?._id;
  try {
    const checkCall = await Call.findById(callId); // Fixed typo: findbyId → findById
    if (!checkCall) {
      return res
        .status(400)
        .json({ success: false, message: "Call not found" });
    }
    if (checkCall.isInCall === false) {
      return res
        .status(400)
        .json({ success: false, message: "Call has already ended" });
    }
    if (
      checkCall.callStatus !== "ongoing" &&
      checkCall.callStatus !== "accepted"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Call is not ongoing" });
    }
    let endTime = new Date();
    if (checkCall.callStatus === "ongoing") {
      // Call was not accepted yet (ringing stage)
      checkCall.callStatus = "rejected";
      checkCall.callRejectedBy = userId;
      checkCall.callRejectedAt = endTime;
      checkCall.callEndedAt = endTime;
    } else {
      // Call was accepted and is now ending
      checkCall.callStatus = "ended";
      checkCall.callEndedBy = userId;
      checkCall.callEndedAt = endTime;
    }
    // Calculate duration in seconds
    const startTime = checkCall.callAcceptedAt || checkCall.callStartedAt; // Use acceptedAt if available
    const durationSeconds = Math.floor((endTime - startTime) / 1000); // Difference in milliseconds → seconds
    checkCall.callDuration = durationSeconds;
    // Mark call as ended
    checkCall.isInCall = false;
    await checkCall.save();
    return res.status(200).json({
      success: true,
      message: "Call ended successfully",
      callDuration: durationSeconds,
    });
  } catch (error) {
    console.log("error on endCall: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

/* exports.endCall = async (req, res) => {
    const callId = req.body?.callId
    const userId = req.payload?._id;
    try {
        const checkCall = await Call.findbyId(callId);
        if (!checkCall) {
            return res.status(400).json({ success: false, message: "Call not found", });
        }

        if (checkCall.isInCall == false) {
            return res.status(400).json({ success: false, message: "Call has ended", });
        }

        if (checkCall.callStatus !== "ongoing" && checkCall.callStatus !== "accepted") {
            return res.status(400).json({ success: false, message: "Call is not ongoing" });
        }
        checkCall.callEndedAt = new Date();
        if (checkCall.callStatus == "ongoing") {
            checkCall.callStatus = "rejected";
            checkCall.callRejectedBy = userId;
            checkCall.callRejectedAt = new Date();
        } else {
            checkCall.callStatus = "ended";
            checkCall.callEndedBy = userId;
            checkCall.callEndedAt = new Date();
        }

        await checkCall.save();
        return res.status(200).json({ success: true, message: "Call ended successfully", });
    } catch (error) {
        console.log("error on endCall: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
} */

exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.query.userId || req.payload?._id;
    if (!userId) return sendError(res, 400, "User ID is required");
    const filters = {
      callType: req.query.callType,
      callStatus: req.query.callStatus,
      isInCall: req.query.isInCall,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const result = await callService.getCallHistory(
      userId,
      filters,
      pagination
    );
    return sendSuccess(res, 200, "Call history fetched successfully", result);
  } catch (error) {
    console.error("Error fetching call history:", error);
    return sendError(
      res,
      error.statusCode || 500,
      error.message || "Internal Server Error"
    );
  }
};
