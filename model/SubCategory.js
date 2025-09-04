const mongoose = require('mongoose')

const SubCategorySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }
}, { timestamps: true })
const SubCategory = mongoose.model('SubCategory', SubCategorySchema)
module.exports = SubCategory