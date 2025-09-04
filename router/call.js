const express = require('express')
const { verifyToken } = require('../middleware/authValidation')
const { initiateCall, acceptCall, endCall } = require('../controller/call')
const callRouter = express.Router()


callRouter.post('/initiate', verifyToken, initiateCall)
callRouter.put('/accept', verifyToken, acceptCall)
callRouter.post('/end', verifyToken, endCall)



module.exports = callRouter