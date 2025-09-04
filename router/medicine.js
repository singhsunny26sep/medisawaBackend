const express = require('express')
const { verifyToken } = require('../middleware/authValidation')
const { addMedicine, getAllMedicine, getWithPagination, getOfferMedicines, getMedicinesByCategory, getSubCategoryMedicines, getByBrandMedicines, serachByTitle, updateMedicineImage, deleteMedicineImage, addMedicineImage, updateMedicineSize, deleteMedicineSize, addMedicineSize, updateMedicine, getMedicinesByCategoriesWise } = require('../controller/medicine')
const medicineRouter = express.Router()


medicineRouter.get('/getAll', getAllMedicine)
medicineRouter.get('/getOne/:id', getAllMedicine)

medicineRouter.get('/pagination', getWithPagination)

medicineRouter.get('/search', serachByTitle)

medicineRouter.get('/offer', getOfferMedicines)
medicineRouter.get('/category/:id', getMedicinesByCategory)
medicineRouter.get('/subCategory/:id', getSubCategoryMedicines)
medicineRouter.get('/brand/:id', getByBrandMedicines)

medicineRouter.post('/add', /* verifyToken, */ addMedicine)
medicineRouter.put('/update/:id', /* verifyToken, */ updateMedicine)

medicineRouter.put('/image/update/:id', /* verifyToken, */ updateMedicineImage) // id should be of image
medicineRouter.delete('/image/delete/:id', /* verifyToken, */ deleteMedicineImage) // id should be of image
medicineRouter.post('/image/add/:id', /* verifyToken, */ addMedicineImage) // id should be of medicine

medicineRouter.put('/size/update/:id', /* verifyToken, */ updateMedicineSize) // id should be of size
medicineRouter.delete('/size/delete/:id', /* verifyToken, */ deleteMedicineSize) // id should be of size
medicineRouter.post('/size/add/:id', /* verifyToken, */ addMedicineSize) // id should be of medicine


medicineRouter.get('/categoriesWiseMedicines', getMedicinesByCategoriesWise)

module.exports = medicineRouter