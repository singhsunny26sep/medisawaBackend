const express = require("express");
const bookingRouter = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  addBooking,
  getBookingData,
  getBookingByPatientId,
  bookingStatusChange,
  cancelBooking,
  getBookingWithPatientAndDoctorId,
  getDoctorByIdBooking,
  getAllBookings,
  getBookingDoctor,
  addBookingByReceptionist,
  getPrescriptions,
} = require("../controller/booking");

bookingRouter.get("/booking", verifyToken, getAllBookings);
bookingRouter.get("/booking/:id", verifyToken, getAllBookings);
bookingRouter.get("/booking/doctor/:id", verifyToken, getDoctorByIdBooking);
bookingRouter.get("/doctor/allBooking", verifyToken, getBookingDoctor);
bookingRouter.get(
  "/patientBooking/patient/:id",
  verifyToken,
  getBookingByPatientId
);
bookingRouter.get("/doctorBookings/:doctorId", verifyToken, getBookingData);
bookingRouter.get(
  "/booking/history/:patientId/:doctorId",
  verifyToken,
  getBookingWithPatientAndDoctorId
);
bookingRouter.post("/book/appointment/:patientId", verifyToken, addBooking);
bookingRouter.post(
  "/book/receptionist/appointment",
  verifyToken,
  addBookingByReceptionist
);
bookingRouter.put("/update/booking/:id", verifyToken, bookingStatusChange);
bookingRouter.put("/cancel/booking/:id", verifyToken, cancelBooking);
bookingRouter.get("/getPrescriptions/:id", verifyToken, getPrescriptions); //appointment id

module.exports = bookingRouter;
