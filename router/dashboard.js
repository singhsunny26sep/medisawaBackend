const express = require('express')
const { dashobard } = require('../controller/dashobard')
const dashboardRouter = express.Router()

dashboardRouter.get('/', dashobard)

module.exports = dashboardRouter