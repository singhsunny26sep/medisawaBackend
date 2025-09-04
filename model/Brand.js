const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema({
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
const Brand = mongoose.model('Brand', BrandSchema)
module.exports = Brand