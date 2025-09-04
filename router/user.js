const express = require('express');
const { registorUser, loginUser, getAllUsers, doctorProfile, doctorProfileAdmin, userProfile, uploadProfileImage, userUpdate, getAllLabUser, requistOtp, verifyOtp, forgotPassword } = require('../controller/user');
const { registrationValidation, loginValidation } = require('../middleware/userValidation');
const { verifyToken } = require('../middleware/authValidation');
const userRouter = express.Router();

// userRouter.get('')

userRouter.post('/register', registrationValidation, registorUser)

userRouter.post('/login', loginValidation, loginUser)

userRouter.post('/request/otp', requistOtp)

userRouter.post('/verify/otp', verifyOtp)

userRouter.post('/forgot/password', forgotPassword)

userRouter.get('/profile/:id', verifyToken, userProfile)

userRouter.get('/profile', verifyToken, userProfile)

userRouter.put('/image/update/profile', verifyToken, uploadProfileImage)

userRouter.put('/profile/update/:id', verifyToken, uploadProfileImage)

userRouter.put('/profile/:id', verifyToken, userUpdate)

userRouter.put('/profile', verifyToken, userUpdate)

// userRouter.get('/userProfile/:id', verifyToken, getAllUsers)

userRouter.get('/doctorProfile/:id', verifyToken, doctorProfile)

userRouter.get('/doctorProfileAdmin/:id', verifyToken, doctorProfileAdmin)

userRouter.get('/lab', getAllLabUser)

module.exports = userRouter