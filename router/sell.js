const express = require('express')
const { verifyToken } = require('../middleware/authValidation')
const { sellesSingle, sellMultiple, salesAnalytics, getSingleUsersSellesHistory, getSingleUsersSellesHistoryAdmin, topSellingMedicines } = require('../controller/sell')
const sellRouter = express.Router()

sellRouter.post('/sellSingle', verifyToken, sellesSingle)

sellRouter.post('/sellMultiple', verifyToken, sellMultiple)

sellRouter.get('/dashboard', verifyToken, salesAnalytics)

sellRouter.get('/sellesHistory', verifyToken, getSingleUsersSellesHistory)

sellRouter.get('/sellesHistory/:id', verifyToken, getSingleUsersSellesHistoryAdmin)

sellRouter.get('/topSellMedicines', topSellingMedicines)

module.exports = sellRouter