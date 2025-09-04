const express = require('express')
const { getAllClinics, getClinicsPaginated, getNearbyClinics, addClinic, updateClinic, deleteClinic } = require('../controller/clinic')
const { verifyToken } = require('../middleware/authValidation')
const clinicRouter = express.Router()

clinicRouter.get('/getAll', getAllClinics)
clinicRouter.get('/getOne/:id', getAllClinics)
clinicRouter.get('/pagination', getClinicsPaginated)
clinicRouter.get('/getByNear', getNearbyClinics)

clinicRouter.post('/add', verifyToken, addClinic)
clinicRouter.put('/update/:id', verifyToken, updateClinic)
clinicRouter.delete('/delete/:id', verifyToken, deleteClinic)


module.exports = clinicRouter