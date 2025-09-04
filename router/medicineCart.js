const express = require('express')
const { getMyCart, addToMedicineCart, removeFromMedicineCart, updateMedicineCart } = require('../controller/medicineCart')
const { verifyToken } = require('../middleware/authValidation')
const medicineCartRouter = express.Router()


medicineCartRouter.get('/getCart', verifyToken, getMyCart)

medicineCartRouter.post('/addToCart', verifyToken, addToMedicineCart)

medicineCartRouter.put('/updateToCart', verifyToken, updateMedicineCart)

medicineCartRouter.delete('/removeFromCart/:id', verifyToken, removeFromMedicineCart)


module.exports = medicineCartRouter