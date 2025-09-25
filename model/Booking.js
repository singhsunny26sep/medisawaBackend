const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
    },
    appointmentTime: {
      type: String,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    prescription: {
      type: String,
    },
    comments: {
      type: String,
    },
    prescriptionFile: {
      type: String,
    },
    consultationFee: {
      type: Number,
    },
    serviceCharge: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    receptionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receptionist",
    },
    type: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Booking", BookingSchema);
