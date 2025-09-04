const Booking = require("../model/Booking");
const LabTest = require("../model/LabTest");
const Patient = require("../model/Patient");
const Vital = require("../model/Vital");


exports.getAllBooking = async (req, res) => {
    const userId = req.payload._id
    try {
        const result = await Booking.find({ receptionistId: userId }).sort({ createdAt: -1 }).populate("patientId").populate("userId").populate("doctorId")
        if (!result) {
            return res.status(404).json({ success: false, msg: "No booking found!" });
        }
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error in getAllBooking:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}


exports.testPayment = async (req, res) => {
    const labTestId = req.params?.id;
    const { paidAmount } = req.body;
    const userId = req.payload._id;

    try {

        if (!labTestId) {
            return res.status(400).json({ success: false, msg: "Lab Test ID is required" });
        }

        const labTest = await LabTest.findById(labTestId);
        if (!labTest) {
            return res.status(404).json({ success: false, msg: "Lab Test not found!" });
        }

        const paidAmountVal = Number(paidAmount) || 0;
        if (paidAmountVal <= 0) {
            return res.status(400).json({ success: false, msg: "Paid amount must be greater than zero" });
        }

        // Store the new payment record in the array
        labTest.paidAmounts.push({ amount: paidAmountVal });

        // Calculate total paid amount
        const totalPaid = labTest.paidAmounts.reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate total paid amount including this new payment
        const newTotalPaid = labTest.totalPaid + paidAmountVal;
        // Check if payment already covers full price
        if (newTotalPaid > labTest.price) {
            return res.status(400).json({ success: false, msg: "Payment exceeds total price." });
        }

        // Calculate due amount
        const dueAmount = labTest.price - totalPaid;

        // Update due amount and paid status
        labTest.due = dueAmount > 0 ? dueAmount : 0;
        labTest.paid = dueAmount === 0;

        // Assign the receptionist ID
        labTest.receptionistId = userId;

        labTest.totalPaid = totalPaid

        // Save the updated document
        await labTest.save();

        return res.status(200).json({ success: true, msg: "Payment updated successfully", result: { totalPaid, due: labTest.due, paid: labTest.paid, payments: labTest.paidAmounts } });
        // return res.status(200).json({ success: true, msg: "Payment updated successfully", result: labTest });

    } catch (error) {
        console.error("Error in testPayment:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
};

exports.paymentMultipleLabTest = async (req, res) => {
    const { paidAmount, labTestIds } = req.body;
    const userId = req.payload._id;

    try {
        if (!labTestIds || !Array.isArray(labTestIds) || labTestIds.length === 0) {
            return res.status(400).json({ success: false, msg: "Lab Test IDs are required" });
        }

        let remainingAmount = Number(paidAmount) || 0;
        if (remainingAmount <= 0) {
            return res.status(400).json({ success: false, msg: "Paid amount must be greater than zero" });
        }

        let results = [];

        for (let id of labTestIds) {
            if (remainingAmount <= 0) break;

            const labTest = await LabTest.findById(id);
            if (!labTest) continue;

            const due = labTest.price - labTest.totalPaid;

            if (due <= 0) continue; // Already fully paid

            const amountToPay = Math.min(due, remainingAmount);

            // Record this payment
            labTest.paidAmounts.push({ amount: amountToPay });
            labTest.totalPaid += amountToPay;
            labTest.due = labTest.price - labTest.totalPaid;
            labTest.paid = labTest.due === 0;
            labTest.receptionistId = userId;

            await labTest.save();

            remainingAmount -= amountToPay;

            results.push({ labTestId: labTest._id, paidAmount: amountToPay, totalPaid: labTest.totalPaid, due: labTest.due, paid: labTest.paid });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, msg: "No applicable lab tests to apply payment." });
        }

        return res.status(200).json({ success: true, msg: "Payment distributed among lab tests successfully", result: results, remainingUnappliedAmount: remainingAmount });

    } catch (error) {
        console.error("Error in paymentMultipleLabTest:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
};


exports.addVitalOfPatient = async (req, res) => {
    const patientId = req.body?.patientId
    const appointment = req.body?.appointment
    const height = req.body?.height
    const weight = req.body?.weight
    const bmi = req.body?.bmi
    const temperature = req.body?.temperature
    const pulseRate = req.body?.pulseRate
    const bloodPressure = req.body?.bloodPressure
    const respirationRate = req.body?.respirationRate

    try {
        const checkPatient = await Patient.findById(patientId)
        if (!checkPatient) {
            return res.status(404).json({ success: false, msg: "Patient not found!" });
        }
        const checkVital = await Vital.findOne({ patientId, appointment })
        if (checkVital) {
            if (height) checkVital.height = height
            if (weight) checkVital.weight = weight
            if (bmi) checkVital.bmi = bmi
            if (temperature) checkVital.temperature = temperature
            if (pulseRate) checkVital.pulseRate = pulseRate
            if (bloodPressure) checkVital.bloodPressure = bloodPressure
            if (respirationRate) checkVital.respirationRate = respirationRate

            await checkVital.save()
            return res.status(200).json({ success: true, msg: "Vital record updated successfully", data: checkVital });
        }
        const vital = new Vital({ patientId, appointment, height, weight, bmi, bloodPressure, temperature, pulseRate, respirationRate })
        await vital.save()
        return res.status(200).json({ success: true, msg: "Vital record added successfully", data: vital });
    } catch (error) {
        console.error("Error in addVitalOfPatient:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}