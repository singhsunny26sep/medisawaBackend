const express = require('express')
const { getAllSubCategory, getAllWithPaginationSubCategory, getSubCategoryByCategory, addSubCategory, updateSubCategory, deleteSubCategory } = require('../controller/subCategory')
const subCatRouter = express.Router()

subCatRouter.get('/getAll', getAllSubCategory)

subCatRouter.get('/getOne/:id', getAllSubCategory)

subCatRouter.get('/pagination', getAllWithPaginationSubCategory)

subCatRouter.get('/category/:id', getSubCategoryByCategory)

subCatRouter.post('/add', /* verifyToken, */ addSubCategory)

subCatRouter.put('/update/:id', /* verifyToken, */ updateSubCategory)

subCatRouter.delete('/delete/:id', /* verifyToken, */ deleteSubCategory)

module.exports = subCatRouter