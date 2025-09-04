const LabTest = require("../model/LabTest")
const Patient = require("../model/Patient")
const Report = require("../model/Report")
const Test = require("../model/Test")
const User = require("../model/User")
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage")

exports.getAllTests = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const tests = await Test.findById(id).populate("userId")
            return res.status(200).json({ success: true, result: tests })
        }
        const result = await Test.find().sort({ createdAt: -1 }).populate("userId", "name email mobile address image")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No tests found!" })
    } catch (error) {
        console.log("error on getAllTests: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getTestByLab = async (req, res) => {
    const id = req.params?.id || req.payload?._id
    try {
        const checkUser = await User.findById(id)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        const tests = await Test.find({ userId: id }).sort({ createdAt: -1 })
        if (tests) {
            return res.status(200).json({ success: true, result: tests })
        }
        return res.status(404).json({ success: false, msg: "No tests found!" })
    } catch (error) {
        console.log("error on getTestByLab: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.addTest = async (req, res) => {
    const id = req.params?.id || req.payload?._id
    const name = req.body?.name
    const description = req.body?.description
    const price = req.body?.price
    const image = req.files?.image

    try {
        const checkUser = await User.findById(id)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        /* if (checkUser.role !== 'lab') {
            return res.status(403).json({ success: false, msg: 'You are not authorized to create a test!' })
        } */

        const test = new Test({ userId: id, name: name, description: description, price: price, })
        if (image) {
            test.image = await uploadToCloudinary(image.tempFilePath)
        }
        const result = await test.save()
        return res.status(200).json({ success: true, msg: 'Test added successfully!', data: result })
    } catch (error) {
        console.log("error on addTest: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.updateTest = async (req, res) => {
    const id = req.params?.id
    const name = req.body?.name
    const description = req.body?.description
    const price = req.body?.price
    const image = req.files?.image
    const userId = req.payload?._id
    try {
        const checkUser = await User.findById(userId)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        const checkTest = await Test.findById(id)
        if (!checkTest) {
            return res.status(404).json({ success: false, msg: 'Test not found!' })
        }

        if (checkUser.role != "admin") {
            if (checkTest.userId.toString() != userId) {
                return res.status(403).json({ success: false, msg: 'You are not authorized to update this test!' })
            }
        }
        if (name) checkTest.name = name
        if (description) checkTest.description = description
        if (price) checkTest.price = price
        if (image) {
            if (checkTest.image) {
                await deleteFromCloudinary(checkTest?.image)
            }
            checkTest.image = await uploadToCloudinary(image.tempFilePath)
        }
        const result = await checkTest.save()
        return res.status(200).json({ success: true, msg: 'Test updated successfully!', data: result })
    } catch (error) {
        console.log("error on updateTest: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.deleteTest = async (req, res) => {
    const id = req.params?.id
    const userId = req.payload?._id
    try {
        const checkUser = await User.findById(userId)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        const checkTest = await Test.findById(id)
        if (!checkTest) {
            return res.status(404).json({ success: false, msg: 'Test not found!' })
        }
        if (checkUser.role != "admin") {
            if (checkTest.userId.toString() != userId) {
                return res.status(403).json({ success: false, msg: 'You are not authorized to update this test!' })
            }
        }
        if (checkTest.image) {
            await deleteFromCloudinary(checkTest?.image)
        }
        const result = await Test.findByIdAndDelete(id)
        return res.status(200).json({ success: true, msg: 'Test deleted successfully!' })
    } catch (error) {
        console.log("error on deleteTest: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.getTestLabPatient = async (req, res) => {
    const userId = req.payload?._id
    try {
        const result = await LabTest.find({ labId: userId, paid: true }).sort({ createdAt: -1 }).populate("patientId", "-allergies -department -__v -createdAt -updatedAt").populate("doctorId").populate("appointmentId", "-__v").populate("test", "-__v").populate("labId", "-password -patientId -__v -createdAt -updatedAt").populate("receptionistId").populate("reports")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found!" })
    } catch (error) {
        console.log("error on getTestLabPatient: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.uploadReport = async (req, res) => {
    const userId = req.payload?._id;
    const labTestId = req.params?.id;
    const { reportName, reportDescription } = req.body;
    const image = req.files?.image; // Assuming the image is uploaded via form-data

    if (!labTestId || !image) {
        return res.status(400).json({ success: false, msg: "Lab Test ID and image/pdf are required" });
    }

    try {
        const checkLabUser = await User.findById(userId)
        if (!checkLabUser) {
            return res.status(400).json({ success: false, msg: "User not found" });
        }
        // Find the lab test
        const labTest = await LabTest.findById(labTestId);
        if (!labTest) {
            return res.status(404).json({ success: false, msg: "Lab Test not found" });
        }

        if (!labTest.paid) {
            return res.status(403).json({ success: false, msg: "Lab Test not paid" });
        }

        // Upload image to Cloudinary
        const uploadedImage = await uploadToCloudinary(image.tempFilePath);
        if (!uploadedImage) {
            return res.status(500).json({ success: false, msg: "Failed to upload image" });
        }

        // Create a new report
        const newReport = new Report({
            patientId: labTest.patientId,
            doctorId: labTest.doctorId,
            labTest: labTestId,
            test: labTest.test,
            reportImage: uploadedImage,
            appointmentId: labTestId.appointmentId,
            labUser: userId
        });

        if (reportName) newReport.reportName = reportName
        if (reportDescription) newReport.reportDescription = reportDescription

        await newReport.save();

        // Update the lab test with the new report
        labTest.reports.push(newReport._id);
        await labTest.save();

        return res.status(200).json({ success: true, msg: "Report uploaded successfully", report: newReport });
    } catch (error) {
        console.error("Error on uploadReport:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
};

exports.updateReport = async (req, res) => {
    const id = req.params?.id
    const userId = req.payload?._id

    const { reportName, reportDescription } = req.body;
    const image = req.files?.image; // Assuming the image is uploaded via form-data
    try {
        const checkReport = await Report.findById(id)
        if (!checkReport) {
            return res.status(404).json({ success: false, msg: 'Report not found!' })
        }
        const checkUser = await User.findById(userId)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        if (checkUser.role != "admin" || checkUser.role != "receptionist" && checkReport.labUser.toString() != userId) {
            return res.status(403).json({ success: false, msg: 'You are not authorized to update this report!' })
        }
        if (reportName) checkReport.reportName = reportName
        if (reportDescription) checkReport.reportDescription = reportDescription
        if (image) {
            if (checkReport.reportImage) {
                await deleteFromCloudinary(checkReport?.reportImage)
            }
            checkReport.reportImage = await uploadToCloudinary(image.tempFilePath)
        }
        const result = await checkReport.save()
        return res.status(200).json({ success: true, msg: 'Report updated successfully!', data: result })
    } catch (error) {
        console.error("Error on updateReport:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}

exports.deleteReport = async (req, res) => {
    const id = req.params?.id
    const userId = req.payload?._id
    try {
        const checkReport = await Report.findById(id)
        if (!checkReport) {
            return res.status(404).json({ success: false, msg: 'Report not found!' })
        }
        const checkUser = await User.findById(userId)
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: 'User not found!' })
        }
        if (checkUser.role != "admin" || checkUser.role != "receptionist" && checkReport.labUser.toString() != userId) {
            return res.status(403).json({ success: false, msg: 'You are not authorized to update this report!' })
        }

        if (checkReport.reportImage) {
            await deleteFromCloudinary(checkReport?.reportImage)
        }

        const result = await Report.findByIdAndDelete(id)
        return res.status(200).json({ success: true, msg: 'Report deleted successfully!' })
    } catch (error) {
        console.error("Error on updateReport:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}

////////////////////////////////////////////////////// other logic ////////////////////////////////////////////////////

exports.mostTakenTest = async (req, res) => {
    try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const result = await LabTest.aggregate([
            {
                $match: {
                    createdAt: { $gte: firstDay, $lte: lastDay },
                    test: { $ne: null } // make sure test field exists
                }
            },
            {
                $group: {
                    _id: "$test",
                    testCount: { $sum: 1 }
                }
            },
            {
                $sort: { testCount: -1 }
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                    from: "tests", // collection name in lowercase and plural (by MongoDB default)
                    localField: "_id",
                    foreignField: "_id",
                    as: "testDetails"
                }
            },
            {
                $unwind: "$testDetails"
            },
            {
                $project: {
                    _id: 0,
                    testId: "$_id",
                    testCount: 1,
                    name: "$testDetails.name",
                    description: "$testDetails.description",
                    price: "$testDetails.price",
                    image: "$testDetails.image",
                }
            }
        ]);

        // console.log("result[0]: ", result);
        if (!result.length) {
            const result = await Test.find().sort({ createdAt: -1 })
            return res.status(200).json({ msg: "Most taken test this month", success: true, result: result[0] || null });
        }
        return res.status(200).json({ msg: "Most taken test this month", success: true, result: result[0] || null });
    } catch (error) {
        console.error("Error in mostTakenTest:", error);
        return res.status(500).json({ msg: error.message, success: false });
    }
};

exports.getPatientList = async (req, res) => {
    const userId = req.payload?._id
    try {
        /* const patientIds = await LabTest.distinct('patientId', { labId: userId })
        const result = await Patient.find({ _id: { $in: patientIds } }); */
        const result = await LabTest.aggregate([
            { $match: { labId: userId } },
            {
                $group: {
                    _id: "$patientId"
                }
            },
            {
                $lookup: {
                    from: "patients", // collection name in lowercase and plural (check your MongoDB)
                    localField: "_id",
                    foreignField: "_id",
                    as: "patient"
                }
            },
            { $unwind: "$patient" },
            {
                $replaceRoot: {
                    newRoot: "$patient"
                }
            }
        ]);

        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found!" })
    } catch (error) {
        console.error("Error in getPatientList:", error);
        return res.status(500).json({ msg: error.message, success: false });
    }
}

exports.getByBookingId = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await LabTest.find({ appointmentId: id }).sort({ createdAt: -1 }).populate("patientId", "-allergies -department -__v -createdAt -updatedAt").populate("doctorId").populate("appointmentId", "-__v").populate("test", "-__v").populate("labId", "-password -patientId -__v -createdAt -updatedAt").populate("receptionistId").populate("reports")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found for this booking!" })
    } catch (error) {
        console.log("error on getByBookingId: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getByPatientId = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await LabTest.find({ patientId: id }).sort({ createdAt: -1 }).populate("patientId", "-allergies -department -__v -createdAt -updatedAt").populate("doctorId").populate("appointmentId", "-__v").populate("test", "-__v").populate("labId", "-password -patientId -__v -createdAt -updatedAt").populate("receptionistId").populate("reports")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found for this booking!" })
    } catch (error) {
        console.log("error on getByPatientId: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getByDoctorId = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await LabTest.find({ doctorId: id }).sort({ createdAt: -1 }).populate("patientId", "-allergies -department -__v -createdAt -updatedAt").populate("doctorId").populate("appointmentId", "-__v").populate("test", "-__v").populate("labId", "-password -patientId -__v -createdAt -updatedAt").populate("receptionistId").populate("reports")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found for this booking!" })
    } catch (error) {
        console.log("error on getByDoctorId: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.getByLabId = async (req, res) => {
    const id = req.params?.id
    const paid = req.query?.paid
    try {
        let filetr = { labId: id }
        if (paid) {
            filetr.paid = paid
        }
        const result = await LabTest.find(filetr).sort({ createdAt: -1 }).populate("patientId", "-allergies -department -__v -createdAt -updatedAt").populate("doctorId").populate("appointmentId", "-__v").populate("test", "-__v").populate("labId", "-password -patientId -__v -createdAt -updatedAt").populate("receptionistId").populate("reports")
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found for this booking!" })
    } catch (error) {
        console.log("error on getByLabId: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

// ================================= web test booking =================================
exports.bookTest = async (req, res) => {
    const id = req.params?.id ///test id
    const userId = req.payload?._id

    const patientId = req.body?.patientId
    const paidAmount = req.body?.paidAmount
    try {
        const checkUser = await User.findById(userId)
        if (!checkUser) {
            return res.status(403).json({ error: "You are not authorized to add a lab test" });
        }
        const checkLab = await Test.findById(id)
        if (!checkLab) {
            return res.status(400).json({ error: "Invalid lab test" });
        }
        // Create a new lab test
        // const newLabTest = new LabTest({ testId, doctorId: checkDoctor?.doctorId, patientId, appointmentId, labId: checkLab?.userId });
        const newLabTest = new LabTest({ patientId: patientId ? patientId : checkUser?.patientId[0], testName: checkLab.name, test: id, labId: checkLab?.userId, price: checkLab.price, appointmentId,/*  paid: true, */ totalPaid: paidAmount, paidAmounts: [{ amount: paidAmount }] });
        const result = await newLabTest.save()
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "No Lab Tests found for this booking!" })
    } catch (error) {
        console.log("error on bookTest: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}