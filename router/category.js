const express = require('express');
const { getAllCategory, addCategory, updateCategory, deleteCategory, getAllWithPagination, getSubacategory } = require('../controller/Category');
const { verifyToken } = require('../middleware/authValidation');
const categoryRouter = express.Router();

categoryRouter.get('/getAll', getAllCategory)

categoryRouter.get('/getOne/:id', getAllCategory)

categoryRouter.get('/pagination', getAllWithPagination)
categoryRouter.get('/categoryWithSubscategories', getSubacategory)

categoryRouter.post('/add', /* verifyToken, */ addCategory)

categoryRouter.put('/update/:id', /* verifyToken, */ updateCategory)

categoryRouter.delete('/delete/:id', /* verifyToken, */ deleteCategory)

module.exports = categoryRouter