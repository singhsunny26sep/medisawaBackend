const express = require('express')
const { getAllContact, contactPagination, addCotactForm, updateContact, deleteContact } = require('../controller/contact')
const { verifyToken } = require('../middleware/authValidation')
const contactRouter = express.Router()

contactRouter.get('/getOne/:id', getAllContact)
contactRouter.get('/getAll', getAllContact)
contactRouter.get('/pagination', contactPagination)


contactRouter.post('/add', addCotactForm)
contactRouter.put('/update/:id', verifyToken, updateContact)
contactRouter.delete('/delete/:id', verifyToken, deleteContact)

module.exports = contactRouter