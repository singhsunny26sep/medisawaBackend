const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    labUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    labTest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabTest',
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    reportName: {
        type: String,
        // required: true
    },
    reportDescription: {
        type: String,
    },
    reportImage: {
        type: String,
    }
}, { timestamps: true })
const Report = mongoose.model('Report', ReportSchema)
module.exports = Report