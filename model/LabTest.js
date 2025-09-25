const mongoose = require("mongoose");

const LabTestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    testName: {
      type: String,
    },
    testDescription: {
      type: String,
    },
    testResults: {
      type: String,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    due: {
      type: Number,
      default: 0,
    },
    receptionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    advance: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    paidAmounts: [
      {
        amount: { type: Number, required: true, default: 0 },
        date: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
    type: {
      type: String,
      enum: ["package", "test"],
      default: "test",
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("LabTest", LabTestSchema);
