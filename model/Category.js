const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String
    }
}, { timestamps: true })
const Category = mongoose.model('Category', CategorySchema)
module.exports = Category 