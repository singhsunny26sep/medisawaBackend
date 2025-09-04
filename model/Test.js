const mongoose = require('mongoose');
const TestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    }
}, { timestamps: true })


const Test = mongoose.model('Test', TestSchema)
module.exports = Test