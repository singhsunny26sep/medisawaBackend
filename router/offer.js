const express = require('express')
const { getAllOffer, getAllWithPagination, addOffer, updateOffer, deleteOffer } = require('../controller/offer')
const { verifyToken } = require('../middleware/authValidation')
const offerRouter = express.Router()

offerRouter.get('/getAll', getAllOffer)
offerRouter.get('/getOne/:id', getAllOffer)
offerRouter.get('/pagination', getAllWithPagination)

offerRouter.post('/add', /* verifyToken, */ addOffer)

offerRouter.put('/update/:id', /* verifyToken, */ updateOffer)

offerRouter.get('/delete/:id',/* verifyToken, */ deleteOffer)


module.exports = offerRouter