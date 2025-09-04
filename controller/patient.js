const Patient = require("../model/Patient")
const User = require("../model/User")
const { deleteFromCloudinary, uploadToCloudinary } = require("../service/uploadImage")



exports.addProfilePatient = async (req, res) => {
    const id = req.params?.id
    const name = req.body?.name
    const contactNumber = req.body?.contactNumber
    const emergencyNumber = req.body?.emergencyNumber
    const address = req.body?.address
    const dob = req.body?.dob
    const gender = req.body?.gender
    const disease = req.body?.disease
    const department = req.body?.department
    const bloodGroup = req.body?.bloodGroup
    const symptom = req.body?.symptom

    try {

        if (!id) {
            return res.status(400).json({ error: "id is required", success: false, msg: "id is required" })
        }
        const checkUser = await User.findById(id)
        if (!checkUser) {
            return res.status(404).json({ error: "User not found", success: false, msg: "User not found" })
        }
        const checkPatient = await Patient.findOne({ userId: id })
        if (!checkPatient) {
            let imageUrl
            if (image) {
                imageUrl = await uploadToCloudinary(image.tempFilePath)
            }
            const result = await Patient.create({ userId: id, name, contactNumber, emergencyNumber, address, dob, gender, disease, department, bloodGroup, image: imageUrl ? imageUrl : checkUser?.image })
            if (result) {
                return res.status(201).json({ success: true, msg: "Profile created successfully", data: result })
            }
            return res.status(400).json({ error: "Failed to create profile", success: false, msg: "Failed to create profile" })
        }
        if (name) checkPatient.name = name
        if (emergencyNumber) checkPatient.emergencyNumber = emergencyNumber
        if (department) checkPatient.department = department
        if (address) checkPatient.address = address
        if (gender) checkPatient.gender = gender
        if (disease) checkPatient.disease = disease
        if (contactNumber) checkPatient.contactNumber = contactNumber
        if (bloodGroup) checkPatient.bloodGroup = bloodGroup
        if (dob) checkPatient.dob = dob

        if (Array.isArray(symptom) && symptom.length > 0) {
            checkPatient.symptom = symptom;
        }

        if (image) {
            if (checkPatient.image) {
                await deleteFromCloudinary(checkPatient.image);
            }
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            checkPatient.image = imageUrl
        }

        const result = await checkPatient.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Profile updated successfully", data: result })
        }
        return res.status(200).json({ success: true, msg: "Profile created successfully", data: result })

    } catch (error) {
        console.log("error on addProfilePatient: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}