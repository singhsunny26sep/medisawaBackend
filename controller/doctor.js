const Booking = require("../model/Booking");
const Cart = require("../model/Cart");
const Department = require("../model/Department");
const Doctor = require("../model/Doctor");
const LabTest = require("../model/LabTest");
const Patient = require("../model/Patient");
const Prescription = require("../model/Prescription");
const Specialization = require("../model/Specialization");
const Test = require("../model/Test");
const User = require("../model/User");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");

exports.getAllDoctors = async (req, res) => {
  const id = req.params?.id;
  const userId = req?.payload?._id;
  try {
    if (id) {
      // const doctor = await Doctor.findById(id)
      const result = await User.findById(id).populate({
        path: "doctorId", // Populate the doctorId field
        populate: [
          { path: "department", select: "name" }, // Populate the department field inside doctor
          { path: "specialization", select: "name" }, // Populate the specialization field inside doctor
        ],
      });
      const cart = await Cart.findOne({
        userId: userId,
        doctorId: result?.doctorId?._id,
      });
      if (result) {
        return res.status(200).json({ success: true, result, cart });
      }
      return res.status(404).json({ success: false, msg: "Doctor not found!" });
    }
    const result = await User.find({ role: "doctor" })
      .select("-password -__v -patientId")
      .sort({ createdAt: -1 })
      .populate({
        path: "doctorId", // Populate the doctorId field
        populate: [
          { path: "department", select: "name" }, // Populate the department field inside doctor
          { path: "specialization", select: "name" }, // Populate the specialization field inside doctor
        ],
      });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No doctors found!" });
  } catch (error) {
    console.log("error on getAllDoctors: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.toggleActiveStatus = async (req, res) => {
  const id = req.params?.doctorId;
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found!", success: false });
    }
    doctor.isActive = !doctor.isActive;
    await doctor.save();
    return res.status(200).json({
      msg: "Doctor status updated successfully",
      success: true,
      doctor,
    });
  } catch (error) {
    console.log("error on toggleActiveStatus: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.topRatedDoctor = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const result = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDay, $lte: lastDay },
          bookingStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$doctorId",
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "doctor.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Lookup specialization
      {
        $lookup: {
          from: "specializations",
          localField: "doctor.specialization",
          foreignField: "_id",
          as: "specialization",
        },
      },
      {
        $unwind: { path: "$specialization", preserveNullAndEmptyArrays: true },
      },
      // Lookup department
      {
        $lookup: {
          from: "departments",
          localField: "doctor.department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          bookingCount: 1,
          name: "$user.name",
          email: "$user.email",
          mobile: "$user.mobile",
          role: "$user.role",
          address: "$user.address",
          image: "$user.image",
          createdAt: "$user.createdAt",
          updatedAt: "$user.updatedAt",
          doctorId: {
            _id: "$doctor._id",
            userId: "$doctor.userId",
            email: "$doctor.email",
            name: "$doctor.name",
            specialization: {
              _id: "$specialization._id",
              name: "$specialization.name",
            },
            experience: "$doctor.experience",
            department: {
              _id: "$department._id",
              name: "$department.name",
            },
            image: "$doctor.image",
            dob: "$doctor.dob",
            startTime: "$doctor.startTime",
            endTime: "$doctor.endTime",
            clinicAddress: "$doctor.clinicAddress",
            contactNumber: "$doctor.contactNumber",
            clinicContactNumber: "$doctor.clinicContactNumber",
            gender: "$doctor.gender",
            fee: "$doctor.fee",
            oldFee: "$doctor.oldFee",
            address: "$doctor.address",
            onLeave: "$doctor.onLeave",
            createdAt: "$doctor.createdAt",
            updatedAt: "$doctor.updatedAt",
          },
        },
      },
    ]);
    // If no top doctor found this month, return all doctors with populated user/specialization/department
    if (!result.length) {
      const doctors = await Doctor.find()
        .populate("userId")
        .populate("specialization", "name")
        .populate("department", "name");
      return res.status(200).json({
        msg: "No top doctor this month, showing all doctors",
        success: true,
        result: doctors,
      });
    }
    return res
      .status(200)
      .json({ msg: "Ok", success: true, result: result[0] });
  } catch (error) {
    console.error("Error in topRatedDoctor:", error);
    return res.status(500).json({ msg: error.message, success: false });
  }
};

exports.getDoctorProfile = async (req, res) => {
  const id = req.payload?._id;
  try {
    const doctor = await Doctor.findOne({ userId: id })
      .populate({ path: "specialization", select: "name _id" })
      .populate({ path: "department", select: "name _id" });
    if (doctor) {
      return res.status(200).json({ success: true, result: doctor });
    }
    return res.status(404).json({ success: false, msg: "Doctor not found!" });
  } catch (error) {
    console.log("error on getDoctorProfile: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.searchDoctorByCategoryOrbySpacailization = async (req, res) => {
  const id = req.params?.id; // either category or spacailization
  const type = req?.query?.type;

  try {
    let query = {};
    if (type == "Specialist") {
      query.specialization = id;
    } else {
      query.department = id;
    }

    const result = await Doctor.find(query)
      .populate({ path: "specialization", select: "name" })
      .populate({ path: "department", select: "name" });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No doctors found!" });
  } catch (error) {
    console.log("error on searchDoctorByCategoryOrbySpacailization: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.searchBySymptom = async (req, res) => {
  const symptom = req.query.symptom;
  // console.log(" =========================== req.query.symptom =================================");
  // console.log("req.quer: ", req.query);
  // console.log("symptom", symptom);

  try {
    if (!symptom || symptom.trim() === "") {
      return res.status(400).json({ message: "Symptom query is required." });
    }

    // If multiple symptoms are passed as comma-separated (optional handling)
    const symptomsArray = symptom.split(",").map((s) => s.trim());

    const doctors = await Doctor.find({ symptom: { $in: symptomsArray } })
      .populate({ path: "specialization", select: "name" })
      .populate({ path: "department", select: "name" });

    return res
      .status(200)
      .json({ success: true, count: doctors.length, result: doctors });
  } catch (error) {
    console.error("Error searching doctors by symptom:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addProfile = async (req, res) => {
  const id = req.params?.id; //user id
  const name = req.body?.name;
  const email = req.body?.email;
  const specialization = req.body?.specialization;
  const experience = req.body?.experience;
  const department = req.body?.department;
  const image = req.files?.image;
  const startTime = req.body?.startTime;
  const endTime = req.body?.endTime;
  const clinicAddress = req.body?.clinicAddress;
  const address = req.body?.address;
  const contactNumber = req.body?.contactNumber;
  const clinicContactNumber = req.body?.clinicContactNumber;
  const coordinates = req.body?.coordinates;
  const dob = req.body?.dob;
  const gender = req.body?.gender;
  const fee = req.body?.fee;
  const oldFee = req.body?.oldFee;
  const bookingBeforeTime = req.body?.bookingBeforeTime;
  let symptom = req.body?.symptom;
  try {
    if (typeof symptom === "string") {
      symptom = JSON.parse(symptom);
    }
    if (!id) {
      return res.status(400).json({ msg: "Id is required!", success: false });
    }
    const checkUser = await User.findById(id);
    if (checkUser.role !== "doctor") {
      return res.status(403).json({
        msg: "You are not authorized to create a doctor profile!",
        success: false,
      });
    }
    if (!checkUser) {
      return res.status(404).json({ msg: "user not found!", success: false });
    }
    const checkDoctory = await Doctor.findOne({ userId: id });
    if (!checkDoctory) {
      let imageUrl;
      if (image) {
        imageUrl = await uploadToCloudinary(image.tempFilePath);
      }
      const newDoctor = new Doctor({
        userId: id,
        name: name ? name : checkUser?.name,
        specialization,
        experience,
        department,
        image: imageUrl ? imageUrl : checkUser?.image,
        startTime,
        endTime,
        clinicAddress,
        contactNumber,
        clinicContactNumber,
        coordinates,
        dob,
        gender,
        email: email ? email : checkUser?.email,
        fee,
        oldFee,
        bookingBeforeTime,
        address,
      });
      await Specialization.updateOne(
        { _id: specialization }, // Find the specialization by its ID
        { $inc: { doctorCount: 1 } } // Increment doctorCount by 1
      );
      await Department.updateOne(
        { _id: department }, // Find the specialization by its ID
        { $inc: { doctorCount: 1 } } // Increment doctorCount by 1
      );
      checkUser.doctorId = newDoctor._id;
      await checkUser.save();
      const result = await newDoctor.save();
      // let result = "ok"
      if (result) {
        return res.status(200).json({
          msg: "Profilie completed successfully",
          success: true,
          result,
        });
      }
    }
    if (name) checkDoctory.name = name;
    if (specialization) checkDoctory.specialization = specialization;
    if (experience) checkDoctory.experience = experience;
    if (department) checkDoctory.department = department;
    if (startTime) checkDoctory.startTime = startTime;
    if (endTime) checkDoctory.endTime = endTime;
    if (clinicAddress) checkDoctory.clinicAddress = clinicAddress;
    if (contactNumber) checkDoctory.contactNumber = contactNumber;
    if (clinicContactNumber)
      checkDoctory.clinicContactNumber = clinicContactNumber;
    if (coordinates) checkDoctory.coordinates = coordinates;
    if (dob) checkDoctory.dob = dob;
    if (gender) checkDoctory.gender = gender;
    if (email) checkDoctory.email = email;
    if (fee) checkDoctory.fee = fee;
    if (oldFee) checkDoctory.oldFee = oldFee;
    if (bookingBeforeTime) checkDoctory.bookingBeforeTime = bookingBeforeTime;
    if (address) checkDoctory.address = address;
    if (Array.isArray(symptom) && symptom.length > 0) {
      checkDoctory.symptom = symptom;
    }
    if (image) {
      if (checkDoctory.image) {
        await deleteFromCloudinary(checkDoctory.image);
      }
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      checkDoctory.image = imageUrl;
    }
    const result = await checkDoctory.save();
    // let result = "ok"
    if (result) {
      return res.status(200).json({
        msg: `Doctor ${
          name ? name : checkDoctory?.name
        } profile updated successfully.`,
        success: true,
        result,
      });
    }
    return res.status(400).json({
      msg: `Failed to updated doctor ${
        name ? name : checkDoctory.name
      } profile!`,
      success: false,
    });
  } catch (error) {
    console.log("error on addProfile: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

// add medicines and prescription
exports.addReceptOfPatient = async (req, res) => {
  const id = req.payload?._id;
  try {
    const { patientId, appointmentId, medicines } = req.body;
    const prescription = req.files?.image;
    const digitalSignature = req.files?.digitalSignature;
    const clinicSummary = req.body?.clinicSummary;
    const allergy = req.body?.allergy;
    const details = req.body?.details;
    const invastigationAdvice = req.body?.invastigationAdvice;
    const bp = req.body?.bp;
    const pr = req.body?.pr;
    const temp = req.body?.temp;
    const spo = req.body?.spo;
    const rr = req.body?.rr;
    const rbs = req.body?.rbs;
    const clinicIssues = req.body?.clinicIssues;
    const checkDoctor = await User.findById(id);
    if (!checkDoctor) {
      return res
        .status(403)
        .json({ error: "You are not authorized to add a recept" });
    }
    // Validate required fields
    if (!patientId || !appointmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Create a new prescription
    const newPrescription = new Prescription({
      patientId,
      doctorId: checkDoctor?.doctorId,
      appointmentId,
      medicines,
      prescription,
      clinicSummary,
      allergy,
      details,
      invastigationAdvice,
      bp,
      pr,
      temp,
      spo,
      rr,
      rbs,
      clinicIssues,
    });
    if (digitalSignature) {
      const imageUrl = await uploadToCloudinary(digitalSignature.tempFilePath);
      newPrescription.digitalSignature = imageUrl;
      // await deleteFromCloudinary(digitalSignature.tempFilePath); // Delete the temporary file after uploading to Cloudinary
    }
    if (prescription) {
      const imageUrl = await uploadToCloudinary(prescription.tempFilePath);
      newPrescription.prescription = imageUrl;
      // await deleteFromCloudinary(prescription.tempFilePath); // Delete the temporary file after uploading to Cloudinary
    }
    // Save the prescription to the database
    await newPrescription.save();
    return res.status(201).json({
      message: "Prescription added successfully",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Error in addReceptOfPatient:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.addLabTest = async (req, res) => {
  const testId = req.body?.testId;
  const doctorId = req.payload?._id; // it will be doctor id not user id
  const patientId = req.body?.patientId; //it will be patient id not user id
  const appointmentId = req.body?.appointmentId;
  try {
    const checkDoctor = await User.findById(doctorId);
    if (!checkDoctor) {
      return res
        .status(403)
        .json({ error: "You are not authorized to add a lab test" });
    }
    // Validate required fields
    if (!testId || !patientId || !appointmentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const checkAppointment = await Booking.findById(appointmentId);
    if (!checkAppointment) {
      return res.status(400).json({ error: "Invalid appointment" });
    }
    const checkLab = await Test.findById(testId);
    if (!checkLab) {
      return res.status(400).json({ error: "Invalid lab test" });
    }
    // Create a new lab test
    // const newLabTest = new LabTest({ testId, doctorId: checkDoctor?.doctorId, patientId, appointmentId, labId: checkLab?.userId });
    const newLabTest = new LabTest({
      patientId,
      doctorId: checkDoctor?.doctorId,
      testName: checkLab.name,
      test: testId,
      labId: checkLab?.userId,
      price: checkLab.price,
      appointmentId,
    });
    // Save the lab test to the database
    await newLabTest.save();
    return res
      .status(201)
      .json({ message: "Lab test added successfully", labTest: newLabTest });
  } catch (error) {
    console.error("Error in addLabTest:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
