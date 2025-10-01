const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getAllDoctorUser,
  getAllPatientUser,
  getAllManagerUser,
  getAllHospitalUser,
  getAllNursingUser,
  getAllMedicalUser,
  getAllReceptionistUser,
  getAllLabUser,
  getAllLabBoyUser,
  getAllAdminUser,
  doctorProfile,
  doctorProfileAdmin,
  userProfile,
  uploadProfileImage,
  userUpdate,
  requistOtp,
  verifyOtp,
  forgotPassword,
} = require("../controller/user");
const {
  registrationValidation,
  loginValidation,
} = require("../middleware/userValidation");
const { verifyToken } = require("../middleware/authValidation");
const userRouter = express.Router();

// Authentication routes
userRouter.post("/register", registrationValidation, registerUser);
userRouter.post("/login", loginValidation, loginUser);
userRouter.post("/request/otp", requistOtp);
userRouter.post("/verify/otp", verifyOtp);
userRouter.post("/forgot/password", forgotPassword);

// Get all users (admin only - optional)
userRouter.get("/", verifyToken, getAllUsers);

// Get users by role
userRouter.get("/doctors", verifyToken, getAllDoctorUser);
userRouter.get("/patients", verifyToken, getAllPatientUser);
userRouter.get("/managers", verifyToken, getAllManagerUser);
userRouter.get("/hospitals", verifyToken, getAllHospitalUser);
userRouter.get("/nursing", verifyToken, getAllNursingUser);
userRouter.get("/medical", verifyToken, getAllMedicalUser);
userRouter.get("/receptionists", verifyToken, getAllReceptionistUser);
userRouter.get("/lab", verifyToken, getAllLabUser);
userRouter.get("/labBoys", verifyToken, getAllLabBoyUser);
userRouter.get("/admins", verifyToken, getAllAdminUser);

// Profile routes
userRouter.get("/profile/:id", verifyToken, userProfile);
userRouter.get("/profile", verifyToken, userProfile);
userRouter.get("/doctorProfile/:id", verifyToken, doctorProfile);
userRouter.get("/doctorProfileAdmin/:id", verifyToken, doctorProfileAdmin);

// Update routes
userRouter.put("/image/update/profile", verifyToken, uploadProfileImage);
userRouter.put("/profile/update/:id", verifyToken, uploadProfileImage);
userRouter.put("/profile/:id", verifyToken, userUpdate);
userRouter.put("/profile", verifyToken, userUpdate);

module.exports = userRouter;