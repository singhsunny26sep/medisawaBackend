const { generateToken } = require("../middleware/authValidation");
const Doctor = require("../model/Doctor");
const Patient = require("../model/Patient");
const User = require("../model/User");
const { urlVerifyOtp, urlSendTestOtp } = require("../service/sendOTP");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");
const bcrypt = require("bcryptjs");
let salt = 10;

exports.getAllLabUser = async (req, res) => {
  try {
    const users = await User.find({ role: "lab" });
    if (users) {
      return res.status(200).json({ success: true, result: users });
    }
    return res.status(404).json({ success: false, msg: "Users not found!" });
  } catch (error) {
    console.log("error on getAllLabUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.registorUser = async (req, res) => {
  const name = req.body?.name;
  const email = req.body?.email;
  const mobile = req.body?.mobile;
  const password = req.body?.password;
  const role = req.body?.role;
  const address = req.body?.address;
  const image = req.files?.image;
  try {
    const checkUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (checkUser) {
      return res
        .status(400)
        .json({ success: false, msg: "Email or Mobile Number already exists" });
    }
    const hashedPass = await bcrypt.hash(password, parseInt(salt));
    if (!hashedPass) {
      return res
        .status(400)
        .json({ success: false, msg: "Failed to register!" });
    }
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPass,
      role,
      address,
    });
    if (role && role === "admin") {
      return res
        .status(400)
        .json({ success: false, msg: "Admin role is not allowed" });
    } else if (role && role === "doctor") {
    }
    const patient = await Patient.create({
      userId: user._id,
      name,
      email,
      mobile,
      password: hashedPass,
      role,
      address,
    });
    user.patientId.push(patient?._id);
    if (image) {
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      user.image = imageUrl;
    }
    const result = await user.save();
    if (result) {
      const token = await generateToken(result);
      return res.status(200).json({
        success: true,
        msg: `User registered successfully`,
        result,
        token,
      });
    }
    return res.status(400).json({
      error: "Failed to register user",
      success: false,
      msg: "Failed to register user",
    });
  } catch (error) {
    console.log("error on registorUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const email = req.body?.email;
  const password = req.body?.password;
  try {
    const checkUser = await User.findOne({ email: email });
    if (!checkUser) {
      return res.status(401).json({
        error: "Invalid credentials",
        success: false,
        msg: "User not found",
      });
    }
    const matchedPass = await bcrypt.compare(password, checkUser.password);
    if (!matchedPass) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }
    const token = await generateToken(checkUser);
    return res
      .status(200)
      .json({ success: true, msg: "User logged in successfully", token });
  } catch (error) {
    console.log("error on loginUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.requistOtp = async (req, res) => {
  const mobile = req.body?.mobile;
  try {
    const checkUser = await User.findOne({ mobile });
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    let result = await urlSendTestOtp(mobile);
    console.log("result: ", result);
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(400).json({ success: false, msg: "Failed to send OTP" });
  } catch (error) {
    console.log("error on requistOtp: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const sessionId = req.body.sessionId;
  const otp = req.body.otp;
  const mobile = req.body?.mobile;
  const fcmToken = req.body?.fcmToken;
  try {
    const checkUser = await User.findOne({ mobile });
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    let result = await urlVerifyOtp(sessionId, otp);

    checkUser.fcmToken = fcmToken;
    await checkUser.save();
    if (result?.Status == "Success") {
      const token = await generateToken(checkUser);
      return res.status(200).json({
        success: true,
        msg: "Verification successful",
        data: result,
        token,
      });
    }
    return res.status(400).json({ success: false, msg: "Invalid OTP" });
  } catch (error) {
    console.log("error on verifyOtp: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const sessionId = req.body.sessionId;
  const otp = req.body.otp;
  const mobile = req.body?.mobile;
  const fcmToken = req.body?.fcmToken;
  const password = req.body?.password;
  try {
    const checkUser = await User.findOne({ mobile });
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    let result = await urlVerifyOtp(sessionId, otp);
    checkUser.fcmToken = fcmToken;
    if (result?.Status == "Success") {
      const hashedPass = await bcrypt.hash(password, parseInt(salt));
      checkUser.password = hashedPass;
      await checkUser.save();
      const token = await generateToken(checkUser);
      return res.status(200).json({
        success: true,
        msg: "Verification successful",
        data: result,
        token,
      });
    }
    return res.status(400).json({ success: false, msg: "Invalid OTP" });
  } catch (error) {
    console.log("error on forgotPassword: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
exports.userProfile = async (req, res) => {
  const id = req.params?.id || req.payload._id; //user id
  // console.log("req.params: ", req.params);
  // const id = req.params?.id //user id
  try {
    const result = await User.findById(id)
      .populate("patientId")
      .populate({
        path: "doctorId",
        populate: [
          { path: "specialization", select: "name" },
          { path: "department", select: "name" },
        ],
      })
      .populate("clinic");
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(400).json({ success: false, msg: "No users found!" });
  } catch (error) {
    console.log("error on userProfile: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  const id = req.params.id || req.payload?._id; //user id
  const image = req.files?.image;
  try {
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    if (checkUser.image) {
      await deleteFromCloudinary(checkUser?.image);
    }
    let imageUrl = await uploadToCloudinary(image.tempFilePath);
    checkUser.image = imageUrl;
    const result = await checkUser.save();
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "Profile image updated successfully",
        data: result,
      });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update profile image!" });
  } catch (error) {
    console.log("error on uploadProfileImage: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.userUpdate = async (req, res) => {
  const id = req.params.id || req.payload?._id; //user id
  const name = req.body?.name;
  const email = req.body?.email;
  const mobile = req.body?.mobile;
  const address = req.body?.address;
  try {
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    if (name) checkUser.name = name;
    if (email) checkUser.email = email;
    if (mobile) checkUser.mobile = mobile;
    if (address) checkUser.address = address;
    const result = await checkUser.save();
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "User updated successfully",
        data: result,
      });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update user!" });
  } catch (error) {
    console.log("error on userUpdate: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.doctorProfile = async (req, res) => {
  const id = req.params.id; //user id
  try {
    if (!id) {
      return res.status(400).json({ success: false, msg: "Invalid ID" });
    }
    const result = await User.findById(id).populate({ path: "doctorId" });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No users found!" });
  } catch (error) {
    console.log("error on doctorProfile: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.doctorProfileAdmin = async (req, res) => {
  const id = req.params.id; //user id
  try {
    const result = await User.findById(id);
    if (!result) {
      return res.status(404).json({ success: false, msg: "No users found!" });
    }
    const doctor = await Doctor.findOne({ userId: id });
    /* if (!doctor) {
            return res.status(404).json({ success: false, msg: 'No doctor profile found!' })
        } */
    return res.status(200).json({ success: true, result, doctor });
  } catch (error) {
    console.log("error on doctorProfileAdmin: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
