const mongoose = require('mongoose')

const EnquerSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    location: {
        type: String
    },
    description: {
        type: String
    }
}, { timestamps: true })

const Enquery = mongoose.model('Enquery', EnquerSchema)
module.exports = Enquery