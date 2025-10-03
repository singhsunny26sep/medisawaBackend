const mongoose = require("mongoose");
const Booking = require("../model/Booking");
const Doctor = require("../model/Doctor");
const User = require("../model/User");
const { generateTimeSlots, TimeFormate } = require("../service/bookingHelper");
const { canBookAppointment } = require("../service/getTimeBefore");
const moment = require("moment");
const {
  sendSingleNotification,
  bookingNotification,
  bookingCancelNotification,
} = require("../service/notification");
const Patient = require("../model/Patient");
const Prescription = require("../model/Prescription");
const LabTest = require("../model/LabTest");
const Report = require("../model/Report");

exports.getAllBookings = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await Booking.findById(id)
        .populate("patientId")
        .populate("userId")
        .populate("doctorId");
      if (result) {
        const prescription = await Prescription.find({
          appointmentId: id,
        }).sort({ createdAt: -1 });
        const labTest = await LabTest.find({ appointmentId: id }).populate(
          "reports"
        );
        const report = await Report.find({ appointmentId: id });

        return res
          .status(200)
          .json({ success: true, result, prescription, labTest, report });
      }
      return res
        .status(404)
        .json({ success: false, msg: "Booking not found!" });
    }
    const result = await Booking.find()
      .populate("patientId")
      .populate("userId")
      .populate("doctorId");

    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No bookings found!" });
  } catch (error) {
    console.error("Error on getAllBookings: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getBookingByPatientId = async (req, res) => {
  const patientId = req.params?.id;
  const userId = req.payload?._id;

  try {
    let query = { userId }; // Base query for filtering by user

    // If patientId is valid, add it to the query
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      query.patientId = patientId;
    }

    const result = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "-password -role -patientId -__v -updatedAt",
      })
      .populate({
        path: "doctorId",
        select: "-password -role -__v -updatedAt -dob -createdAt",
      })
      .populate({ path: "patientId" })
      .lean();

    if (!result) {
      return res
        .status(404)
        .json({ success: false, msg: "No bookings found!" });
    }
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error on getBookingByPatientId: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getDoctorByIdBooking = async (req, res) => {
  const id = req.params?.id; //doctor id

  try {
    const result = await Booking.find({ doctorId: id })
      .populate("userId")
      .populate("patientId")
      .populate("doctorId");
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No bookings found!" });
  } catch (error) {
    console.error("Error on getDoctorByIdBooking: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getBookingDoctor = async (req, res) => {
  const id = req.payload?._id;

  const page = parseInt(req.query.page) || 1; // Get page number from request query
  const limit = parseInt(req.query.limit) || 10; // Number of records per page

  try {
    const checkDoctor = await Doctor.findOne({ userId: id });
    const newDate = new Date();

    const currentDate = moment(newDate).format("YYYY-MM-DD");

    // Step 1: Fetch today's bookings
    const todayBookings = await Booking.find({
      doctorId: checkDoctor?._id,
      appointmentDate: currentDate,
    })
      .sort({ createdAt: -1 })
      .populate("userId")
      .populate("patientId")
      .populate("doctorId");

    if (todayBookings.length > 0) {
      // Step 2: Fetch remaining bookings (excluding today's)
      const remainingBookings = await Booking.find({
        doctorId: checkDoctor?._id,
        appointmentDate: { $ne: currentDate }, // Only past bookings
      })
        .sort({ appointmentDate: -1 }) // Sort latest first
        .populate("userId")
        .populate("patientId")
        .populate("doctorId")
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json({
        result: [...todayBookings, ...remainingBookings], // Combine results
        currentPage: page,
        totalPages: Math.ceil(
          (todayBookings.length + remainingBookings.length) / limit
        ),
        totalRecords: todayBookings.length + remainingBookings.length,
      });
    }

    // Step 3: If no today's bookings, fetch all
    const allBookings = await Booking.find({ doctorId: checkDoctor?._id })
      .sort({ createdAt: -1 }) // Sort latest first
      .populate("userId")
      .populate("patientId")
      .populate("doctorId")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalRecords = await Booking.countDocuments({
      doctorId: checkDoctor?._id,
    });

    return res.json({
      result: allBookings,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    });
    // return res.status(404).json({ success: false, msg: "No bookings found!" });
  } catch (error) {
    console.error("Error on getBookingDoctor: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getBookingWithPatientAndDoctorId = async (req, res) => {
  const { doctorId, patientId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Doctor ID" });
    }

    const checkDoctorUser = await User.findById(doctorId);

    let query = { doctorId: checkDoctorUser?.doctorId };

    if (mongoose.Types.ObjectId.isValid(patientId)) {
      query.patientId = patientId;
    } else {
      query.userId = req.payload?._id;
    }

    const result = await Booking.find(query)
      .populate("doctorId") // Only fetch name & clinicName
      .populate("patientId") // Fetch only patient name
      .populate("userId") // Fetch only user name
      .lean(); // Optimize performance

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "No booking found!" });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error on getBookingWithPatientAndDoctorId:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getBookingData = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }

    if (!date || isNaN(new Date(date))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing date" });
    }

    const checkDoctorUser = await User.findById(doctorId);
    if (!checkDoctorUser?.doctorId) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not linked" });
    }

    const doctor = await Doctor.findById(checkDoctorUser.doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const { startTime, endTime } = doctor;
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor working hours not set" });
    }

    const slots = generateTimeSlots(startTime, endTime, 10);

    const bookedAppointments = await Booking.find({
      doctorId: doctor._id,
      appointmentDate: date,
      bookingStatus: { $ne: "cancelled" },
    });

    const bookedTimes = bookedAppointments.map(
      (booking) => booking.appointmentTime
    );

    const slotData = slots.map((slot) => ({
      time: slot,
      isBooked: bookedTimes.includes(slot),
    }));

    return res
      .status(200)
      .json({ success: true, slots: slotData, result: doctor });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addBooking = async (req, res) => {
  const {
    doctorId,
    appointmentDate,
    appointmentTime,
    consultationFee,
    serviceCharge,
    type,
  } = req.body;
  const patientId = req.params?.patientId;
  const userId = req.payload._id;

  try {
    // 1️⃣ Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found!" });
    }

    // 2️⃣ Validate patient existence (if provided)
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      const patient = await User.findById(patientId);
      if (!patient) {
        return res
          .status(404)
          .json({ success: false, msg: "Patient not found!" });
      }
    }

    // 3️⃣ Validate appointment date (must be in the future)
    if (!canBookAppointment(appointmentDate, appointmentTime, doctor)) {
      return res
        .status(400)
        .json({ msg: "Please book before appointment time", success: false });
    }

    // 4️⃣ Prevent double booking for the same doctor at the same time
    const existingBooking = await Booking.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({
          success: false,
          msg: `Doctor is already booked at ${TimeFormate(appointmentTime)} !`,
        });
    }
    let query = {
      doctorId: doctorId,
      appointmentDate: appointmentDate,
    };
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      query.patientId = patientId;
    } else {
      query.userId = userId;
    }

    const checkPatientAlready = await Booking.findOne(query);
    if (checkPatientAlready) {
      return res
        .status(400)
        .json({
          success: false,
          msg: `Patient is already booked at the same date ${appointmentDate}!`,
        });
    }

    // 5️⃣ Calculate total amount
    const totalAmount = (consultationFee || 0) + (serviceCharge || 0);

    // 6️⃣ Create a new booking
    const newBooking = new Booking({
      patientId: mongoose.Types.ObjectId.isValid(patientId)
        ? patientId
        : userId, // If patientId is not provided, use userId
      userId,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationFee,
      serviceCharge,
      totalAmount,
      // bookingStatus: 'confirmed' // Directly confirm the booking
    });

    await bookingNotification(
      doctorId,
      mongoose.Types.ObjectId.isValid(patientId) ? patientId : userId,
      appointmentDate,
      appointmentTime
    );
    await newBooking.save();

    return res
      .status(201)
      .json({
        success: true,
        msg: "Booking confirmed successfully!",
        result: newBooking,
      });
  } catch (error) {
    console.log("Error on addBooking: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.confirmBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, msg: "Booking not found!" });
    }

    if (booking.bookingStatus === "confirmed") {
      return res
        .status(400)
        .json({ success: false, msg: "Booking is already confirmed!" });
    }

    booking.bookingStatus = "confirmed";
    await booking.save();

    return res
      .status(200)
      .json({ success: true, msg: "Booking confirmed successfully!", booking });
  } catch (error) {
    console.log("Error on confirmBooking: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.bookingStatusChange = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, msg: "Booking not found!" });
    }

    booking.bookingStatus = status;
    await booking.save();

    return res
      .status(200)
      .json({ success: true, msg: "Booking confirmed successfully!", booking });
  } catch (error) {
    console.log("Error on bookingStatusChange: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params; //booking id
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, msg: "Booking not found!" });
    }

    if (booking.bookingStatus === "cancelled") {
      return res
        .status(400)
        .json({ success: false, msg: "Booking is already cancelled!" });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();
    await bookingCancelNotification(req.payload?._id, booking);

    return res
      .status(200)
      .json({ success: true, msg: "Booking cancelled successfully!", booking });
  } catch (error) {
    console.log("Error on cancelBooking: ", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

////////////////////////////////////////////////////// Receptionist ////////////////////////////////////////////////

// Receptionist booking for a patient
exports.addBookingByReceptionist = async (req, res) => {
  // console.log(" ================================ req.body ======================================");

  // console.log("req.body: ", req.body);

  const {
    doctorId,
    appointmentDate,
    patientDetails,
    consultationFee = 0,
    serviceCharge = 0,
  } = req.body;
  const userId = req.payload._id; // Receptionist's ID

  try {
    // 1️⃣ Check if the user already exists with the given mobile number
    let user = await User.findOne({ mobile: patientDetails?.mobile });
    let patient;

    // 4️⃣ Validate doctor existence
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found!" });
    }

    if (!user) {
      // Create a new user if not found
      user = new User({
        name: patientDetails?.name,
        email: patientDetails?.email || `${patientDetails?.mobile}@temp.com`,
        mobile: patientDetails?.mobile,
        password: "defaultPassword123", // Generate a secure password if needed
        role: "patient",
        address: patientDetails?.address,
        patientId: [], // Initialize empty patient array
      });
      await user.save();
    }

    // 2️⃣ Find all patients linked to this userId
    let patients = await Patient.find({ userId: user._id });

    // 3️⃣ Check if a patient with the same name exists
    let existingPatient = patients.find((p) => p.name === patientDetails?.name);

    if (existingPatient) {
      patient = existingPatient;
    } else {
      // If no patient with the same name, create a new patient under the same userId
      patient = new Patient({
        userId: user._id,
        name: patientDetails?.name,
        contactNumber: patientDetails?.mobile,
        emergencyNumber: patientDetails?.emergencyNumber
          ? patientDetails?.emergencyNumber
          : patientDetails?.mobile,
        address: patientDetails?.address,
        gender: patientDetails?.gender,
        bloodGroup: patientDetails?.bloodGroup,
        allergies: patientDetails?.allergies,
        medications: patientDetails?.medications,
        department: doctor?.department,
      });

      await patient.save();

      // Update user's patient list
      user.patientId.push(patient._id);
      await user.save();
    }

    // 5️⃣ Ensure doctor has working hours set
    if (!doctor.startTime || !doctor.endTime) {
      return res
        .status(400)
        .json({ success: false, msg: "Doctor's working hours are not set." });
    }

    // 6️⃣ Generate time slots for the doctor
    const slots = generateTimeSlots(doctor.startTime, doctor.endTime, 10);

    // 7️⃣ Fetch booked slots for the given date
    const bookedAppointments = await Booking.find({
      doctorId: doctor._id,
      appointmentDate,
      // appointmentDate: new Date(appointmentDate),
      bookingStatus: { $ne: "cancelled" },
    });

    const bookedTimes = bookedAppointments.map(
      (booking) => booking.appointmentTime
    );

    // 8️⃣ Find the next available slot
    const availableSlot = slots.find((slot) => !bookedTimes.includes(slot));

    if (!availableSlot) {
      return res
        .status(400)
        .json({
          success: false,
          msg: "No available slots for the selected date.",
        });
    }

    // 9️⃣ Prevent double booking for the same patient on the same day
    const existingBooking = await Booking.findOne({
      doctorId,
      appointmentDate,
      patientId: patient._id,
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({
          success: false,
          msg: `Patient already booked on ${appointmentDate}.`,
        });
    }

    // 🔟 Calculate total amount
    const totalAmount =
      Number(consultationFee) + serviceCharge ? Number(serviceCharge) : 0;

    //  Create a new booking
    const newBooking = new Booking({
      patientId: patient._id,
      userId: user?._id, // Receptionist ID
      doctorId,
      appointmentDate,
      appointmentTime: availableSlot,
      consultationFee,
      serviceCharge,
      totalAmount,
      bookingStatus: "confirmed",
      receptionistId: userId,
    });

    await newBooking.save();

    //  Send notification
    // await bookingNotification(doctorId, patient._id, appointmentDate, availableSlot);
    return res
      .status(201)
      .json({
        success: true,
        msg: "Booking confirmed successfully!",
        result: newBooking,
      });
  } catch (error) {
    console.error("Error in addBookingByReceptionist:", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getPrescriptions = async (req, res) => {
  const id = req.params?.id;
  try {
    const result = await Prescription.findOne({ appointmentId: id });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Prescription not found" });
  } catch (error) {
    console.error("Error in getPrescriptions:", error);
    return res
      .status(500)
      .json({
        success: false,
        msg: "Internal Server Error",
        error: error.message,
      });
  }
};
