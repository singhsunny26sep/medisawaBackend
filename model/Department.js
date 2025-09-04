const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    doctorCount: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
    }
}, { timestamps: true })

const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;