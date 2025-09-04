const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
    },
    image: {
        type: String
    },
    type: {
        type: String
    },
    isPrimary: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
const Image = mongoose.model('Image', ImageSchema)
module.exports = Image