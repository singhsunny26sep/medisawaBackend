const express = require('express')
const { verifyToken } = require('../middleware/authValidation')
const { getAllNotificationsPagination } = require('../controller/notification')
const notifyRouter = express.Router()


notifyRouter.get('/getAll', verifyToken, getAllNotificationsPagination)

module.exports = notifyRouter