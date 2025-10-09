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

exports.getAllDoctorUser = async (req, res) => {
  try {
    const users = await User.find({ role: "doctor" }).populate({
      path: "doctorId",
      populate: [
        { path: "specialization", select: "name" },
        { path: "department", select: "name" },
      ],
    });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Doctor users not found!" });
  } catch (error) {
    console.log("error on getAllDoctorUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllPatientUser = async (req, res) => {
  try {
    const users = await User.find({ role: "patient" }).populate("patientId");
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Patient users not found!" });
  } catch (error) {
    console.log("error on getAllPatientUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllManagerUser = async (req, res) => {
  try {
    const users = await User.find({ role: "manager" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Manager users not found!" });
  } catch (error) {
    console.log("error on getAllManagerUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllHospitalUser = async (req, res) => {
  try {
    const users = await User.find({ role: "hospital" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Hospital users not found!" });
  } catch (error) {
    console.log("error on getAllHospitalUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllNursingUser = async (req, res) => {
  try {
    const users = await User.find({ role: "nursing" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Nursing users not found!" });
  } catch (error) {
    console.log("error on getAllNursingUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllMedicalUser = async (req, res) => {
  try {
    const users = await User.find({ role: "medical" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Medical users not found!" });
  } catch (error) {
    console.log("error on getAllMedicalUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllReceptionistUser = async (req, res) => {
  try {
    const users = await User.find({ role: "receptionist" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Receptionist users not found!" });
  } catch (error) {
    console.log("error on getAllReceptionistUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllLabBoyUser = async (req, res) => {
  try {
    const users = await User.find({ role: "labBoy" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Lab boy users not found!" });
  } catch (error) {
    console.log("error on getAllLabBoyUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllAdminUser = async (req, res) => {
  try {
    const users = await User.find({ role: "admin" });
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Admin users not found!" });
  } catch (error) {
    console.log("error on getAllAdminUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (users && users.length > 0) {
      return res.status(200).json({ success: true, result: users });
    }
    return res.status(404).json({ success: false, msg: "No users found!" });
  } catch (error) {
    console.log("error on getAllUsers: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    mobile,
    password,
    role,
    address,
    experience,
    fee,
    specialization,
    symptom,
    fcmToken,
  } = req.body;
  let image = req.files?.image;
  try {
    if (role && role === "admin") {
      return res
        .status(400)
        .json({ success: false, msg: "Admin role is not allowed" });
    }
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
    if (image) image = await uploadToCloudinary(image.tempFilePath);
    let user = await User.create({
      name,
      email,
      mobile,
      password: hashedPass,
      role,
      address,
      image,
      fcmToken,
    });
    if (role && role === "doctor" && user?.role === "doctor") {
      const newDoctor = await Doctor.create({
        userId: user?._id,
        name: name,
        specialization,
        experience,
        image,
        email,
        contactNumber: mobile,
        fee,
        address,
        symptom,
      });
      user.doctorId = newDoctor?._id;
      user = await user.save();
    } else if (user?.role === "patient") {
      const patient = await Patient.create({
        userId: user._id,
        name,
        image,
        address,
        contactNumber: mobile,
      });
      user.patientId.push(patient?._id);
      user = await user.save();
    }
    const token = await generateToken(user);
    return res.status(200).json({
      success: true,
      msg: `User registered successfully`,
      result: user,
      token,
    });
  } catch (error) {
    console.log("error on registorUser: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    let { email, password, fcmToken } = req.body;
    email = email?.toLowerCase();
    let checkUser = await User.findOne({ email: email });
    if (!checkUser) {
      return res.status(404).json({
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
    if (fcmToken) checkUser.fcmToken = fcmToken;
    checkUser = await checkUser.save();
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
    let checkUser = await User.findOne({ mobile });
    if (!checkUser) checkUser = await User.create({ mobile });
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
  const id = req.params?.id || req.payload._id;
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
  const id = req.params.id || req.payload?._id;
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
  const id = req.params.id || req.payload?._id;
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
    if (email) {
      const checkUserWithEmail = await User.findOne({ email: email });
      if (checkUserWithEmail) {
        return res.status(400).json({
          success: false,
          msg: "Email already exists",
        });
      }
      checkUser.email = email;
    }
    if (mobile) {
      const checkUserWithMobile = await User.findOne({ mobile: mobile });
      if (checkUserWithMobile) {
        return res.status(400).json({
          success: false,
          msg: "Mobile already exists",
        });
      }
      checkUser.mobile = mobile;
    }
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
  const id = req.params.id;
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
  const id = req.params.id;
  try {
    const result = await User.findById(id);
    if (!result) {
      return res.status(404).json({ success: false, msg: "No users found!" });
    }
    const doctor = await Doctor.findOne({ userId: id });
    return res.status(200).json({ success: true, result, doctor });
  } catch (error) {
    console.log("error on doctorProfileAdmin: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

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

// exports.registerUser = async (req, res) => {
//   const {
//     name,
//     email,
//     mobile,
//     password,
//     role,
//     address,
//     experience,
//     fee,
//     specialization,
//     symptom,
//     fcmToken,
//   } = req.body;
//   let image = req.files?.image;
//   try {
//     if (role && role === "admin") {
//       return res
//         .status(400)
//         .json({ success: false, msg: "Admin role is not allowed" });
//     }
//     const checkUser = await User.findOne({ $or: [{ email }, { mobile }] });
//     if (checkUser) {
//       return res
//         .status(400)
//         .json({ success: false, msg: "Email or Mobile Number already exists" });
//     }
//     const hashedPass = await bcrypt.hash(password, parseInt(salt));
//     if (!hashedPass) {
//       return res
//         .status(400)
//         .json({ success: false, msg: "Failed to register!" });
//     }
//     if (image) image = await uploadToCloudinary(image.tempFilePath);
//     let user = await User.create({
//       name,
//       email,
//       mobile,
//       password: hashedPass,
//       role,
//       address,
//       image,
//       fcmToken,
//     });
//     if (role && role === "doctor" && user?.role === "doctor") {
//       const newDoctor = await Doctor.create({
//         userId: user?._id,
//         name: name,
//         specialization,
//         experience,
//         image,
//         email,
//         contactNumber: mobile,
//         fee,
//         address,
//         symptom,
//       });
//       user.doctorId = newDoctor?._id;
//       user = await user.save();
//     } else if (user?.role === "patient") {
//       const patient = await Patient.create({
//         userId: user._id,
//         name,
//         image,
//         address,
//         contactNumber: mobile,
//       });
//       user.patientId.push(patient?._id);
//       user = await user.save();
//     }
//     const token = await generateToken(user);
//     return res.status(200).json({
//       success: true,
//       msg: `User registered successfully`,
//       result: user,
//       token,
//     });
//   } catch (error) {
//     console.log("error on registorUser: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const email = req.body?.email;
//   const password = req.body?.password;
//   const fcmToken = req.body?.fcmToken;
//   try {
//     let checkUser = await User.findOne({ email: email });
//     if (!checkUser) {
//       return res.status(401).json({
//         error: "Invalid credentials",
//         success: false,
//         msg: "User not found",
//       });
//     }
//     const matchedPass = await bcrypt.compare(password, checkUser.password);
//     if (!matchedPass) {
//       return res
//         .status(401)
//         .json({ success: false, msg: "Invalid credentials" });
//     }
//     if (fcmToken) checkUser.fcmToken = fcmToken;
//     const token = await generateToken(checkUser);
//     return res
//       .status(200)
//       .json({ success: true, msg: "User logged in successfully", token });
//   } catch (error) {
//     console.log("error on loginUser: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.requistOtp = async (req, res) => {
//   const mobile = req.body?.mobile;
//   try {
//     let checkUser = await User.findOne({ mobile });
//     if (!checkUser) checkUser = await User.create({ mobile });
//     // return res.status(400).json({ success: false, msg: "User not found!" });
//     let result = await urlSendTestOtp(mobile);
//     console.log("result: ", result);
//     if (result) {
//       return res.status(200).json({ success: true, result });
//     }
//     return res.status(400).json({ success: false, msg: "Failed to send OTP" });
//   } catch (error) {
//     console.log("error on requistOtp: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   const sessionId = req.body.sessionId;
//   const otp = req.body.otp;
//   const mobile = req.body?.mobile;
//   const fcmToken = req.body?.fcmToken;
//   try {
//     const checkUser = await User.findOne({ mobile });
//     if (!checkUser) {
//       return res.status(400).json({ success: false, msg: "User not found!" });
//     }
//     let result = await urlVerifyOtp(sessionId, otp);
//     checkUser.fcmToken = fcmToken;
//     await checkUser.save();
//     if (result?.Status == "Success") {
//       const token = await generateToken(checkUser);
//       return res.status(200).json({
//         success: true,
//         msg: "Verification successful",
//         data: result,
//         token,
//       });
//     }
//     return res.status(400).json({ success: false, msg: "Invalid OTP" });
//   } catch (error) {
//     console.log("error on verifyOtp: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   const sessionId = req.body.sessionId;
//   const otp = req.body.otp;
//   const mobile = req.body?.mobile;
//   const fcmToken = req.body?.fcmToken;
//   const password = req.body?.password;
//   try {
//     const checkUser = await User.findOne({ mobile });
//     if (!checkUser) {
//       return res.status(400).json({ success: false, msg: "User not found!" });
//     }
//     let result = await urlVerifyOtp(sessionId, otp);
//     checkUser.fcmToken = fcmToken;
//     if (result?.Status == "Success") {
//       const hashedPass = await bcrypt.hash(password, parseInt(salt));
//       checkUser.password = hashedPass;
//       await checkUser.save();
//       const token = await generateToken(checkUser);
//       return res.status(200).json({
//         success: true,
//         msg: "Verification successful",
//         data: result,
//         token,
//       });
//     }
//     return res.status(400).json({ success: false, msg: "Invalid OTP" });
//   } catch (error) {
//     console.log("error on forgotPassword: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.userProfile = async (req, res) => {
//   const id = req.params?.id || req.payload._id;
//   try {
//     const result = await User.findById(id)
//       .populate("patientId")
//       .populate({
//         path: "doctorId",
//         populate: [
//           { path: "specialization", select: "name" },
//           { path: "department", select: "name" },
//         ],
//       })
//       .populate("clinic");
//     if (result) {
//       return res.status(200).json({ success: true, result });
//     }
//     return res.status(400).json({ success: false, msg: "No users found!" });
//   } catch (error) {
//     console.log("error on userProfile: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.uploadProfileImage = async (req, res) => {
//   const id = req.params.id || req.payload?._id; //user id
//   const image = req.files?.image;
//   try {
//     const checkUser = await User.findById(id);
//     if (!checkUser) {
//       return res.status(400).json({ success: false, msg: "User not found!" });
//     }
//     if (checkUser.image) {
//       await deleteFromCloudinary(checkUser?.image);
//     }
//     let imageUrl = await uploadToCloudinary(image.tempFilePath);
//     checkUser.image = imageUrl;
//     const result = await checkUser.save();
//     if (result) {
//       return res.status(200).json({
//         success: true,
//         msg: "Profile image updated successfully",
//         data: result,
//       });
//     }
//     return res
//       .status(400)
//       .json({ success: false, msg: "Failed to update profile image!" });
//   } catch (error) {
//     console.log("error on uploadProfileImage: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.userUpdate = async (req, res) => {
//   const id = req.params.id || req.payload?._id;
//   const name = req.body?.name;
//   const email = req.body?.email;
//   const mobile = req.body?.mobile;
//   const address = req.body?.address;
//   try {
//     const checkUser = await User.findById(id);
//     if (!checkUser) {
//       return res.status(400).json({ success: false, msg: "User not found!" });
//     }
//     if (name) checkUser.name = name;
//     if (email) {
//       const checkUserWithEmail = await User.findOne({ email: email });
//       if (checkUserWithEmail) {
//         return res.status(400).json({
//           success: false,
//           msg: "Email already exists",
//         });
//       }
//       checkUser.email = email;
//     }
//     if (mobile) {
//       const checkUserWithMobile = await User.findOne({ mobile: mobile });
//       if (checkUserWithMobile) {
//         return res.status(400).json({
//           success: false,
//           msg: "Mobile already exists",
//         });
//       }
//       checkUser.mobile = mobile;
//     }
//     if (address) checkUser.address = address;
//     const result = await checkUser.save();
//     if (result) {
//       return res.status(200).json({
//         success: true,
//         msg: "User updated successfully",
//         data: result,
//       });
//     }
//     return res
//       .status(400)
//       .json({ success: false, msg: "Failed to update user!" });
//   } catch (error) {
//     console.log("error on userUpdate: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.doctorProfile = async (req, res) => {
//   const id = req.params.id; //user id
//   try {
//     if (!id) {
//       return res.status(400).json({ success: false, msg: "Invalid ID" });
//     }
//     const result = await User.findById(id).populate({ path: "doctorId" });
//     if (result) {
//       return res.status(200).json({ success: true, result });
//     }
//     return res.status(404).json({ success: false, msg: "No users found!" });
//   } catch (error) {
//     console.log("error on doctorProfile: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };

// exports.doctorProfileAdmin = async (req, res) => {
//   const id = req.params.id; //user id
//   try {
//     const result = await User.findById(id);
//     if (!result) {
//       return res.status(404).json({ success: false, msg: "No users found!" });
//     }
//     const doctor = await Doctor.findOne({ userId: id });
//     /* if (!doctor) {
//             return res.status(404).json({ success: false, msg: 'No doctor profile found!' })
//         } */
//     return res.status(200).json({ success: true, result, doctor });
//   } catch (error) {
//     console.log("error on doctorProfileAdmin: ", error);
//     return res
//       .status(500)
//       .json({ error: error, success: false, msg: error.message });
//   }
// };
