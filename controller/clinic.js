const Clinic = require("../model/Clinic");
const User = require("../model/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage");

exports.getAllClinics = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const clinics = await Clinic.findById(id).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, result: clinics });
        }
        const clinics = await Clinic.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, result: clinics });
    } catch (error) {
        console.error("Error in getAllClinics:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};

exports.getClinicsPaginated = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const clinics = await Clinic.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await Clinic.countDocuments();

        return res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), result: clinics });
    } catch (error) {
        console.error("Error in getClinicsPaginated:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


exports.getNearbyClinics = async (req, res) => {
    const { lat, lng, distance } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ success: false, msg: "Latitude and Longitude are required." });
    }

    const radius = distance ? parseFloat(distance) / 6378.1 : 1 / 6378.1; // Default 1km

    try {
        const clinics = await Clinic.find({
            coordinates: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius]
                }
            }
        });

        return res.status(200).json({ success: true, result: clinics });
    } catch (error) {
        console.error("Error in getNearbyClinics:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};




exports.addClinic = async (req, res) => {
    const image = req.files?.image;
    const { name, description, address, city, state, zipCode, latitude, longitude, openTime, closeTime } = req.body;
    const userId = req.payload?._id
    try {

        const checkUser = await User.findById(userId);
        if (!checkUser) {
            return res.status(400).json({ success: false, msg: "User not found!" });
        }
        const checkClinic = await Clinic.findOne({ $or: [{ name, city }, { name, address }] });

        if (checkClinic) {
            return res.status(400).json({ success: false, msg: "Clinic already exists!" });
        }

        let imageUrl = '';
        if (image) {
            imageUrl = await uploadToCloudinary(image.tempFilePath);
        }

        const newClinic = await Clinic.create({
            user: userId,
            name,
            description,
            image: imageUrl,
            address,
            city,
            state,
            zipCode,
            openTime,
            closeTime,
            coordinates: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        });

        if (!newClinic) {
            return res.status(400).json({ success: false, msg: "Failed to create clinic!" });
        }
        checkUser.clinic = newClinic._id
        await checkUser.save()

        return res.status(201).json({ success: true, result: newClinic });

    } catch (error) {
        console.error("Error in addClinic:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


exports.updateClinic = async (req, res) => {
    const clinicId = req.params.id;
    const image = req.files?.image;
    const { name, description, address, city, state, zipCode, latitude, longitude, openTime, closeTime, isOpen } = req.body;

    try {
        let imageUrl = '';
        if (image) {
            imageUrl = await uploadToCloudinary(image.tempFilePath);
        }

        const checkClinic = await Clinic.findById(clinicId);
        if (checkClinic.image) {
            if (image) {
                await deleteFromCloudinary(checkClinic?.image)
            }
        }
        const updatedFields = {
            name,
            description,
            address,
            city,
            state,
            openTime,
            closeTime,
            zipCode,
            isOpen,
            ...(latitude && longitude && {
                coordinates: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            })
        };

        if (imageUrl) {
            updatedFields.image = imageUrl;
        }

        const updatedClinic = await Clinic.findByIdAndUpdate(clinicId, { $set: updatedFields }, { new: true });

        if (!updatedClinic) {
            return res.status(404).json({ success: false, msg: "Clinic not found" });
        }

        return res.status(200).json({ success: true, data: updatedClinic });

    } catch (error) {
        console.error("Error in updateClinic:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


exports.deleteClinic = async (req, res) => {
    const id = req.params?.id
    try {
        const checkClinic = await Clinic.findById(id)
        if (!checkClinic) {
            return res.status(404).json({ success: false, msg: "Clinic not found!" })
        }
        if (checkClinic.image) {
            await deleteFromCloudinary(checkClinic?.image)
        }
        const result = await checkClinic.remove()
        if (result) {
            return res.status(200).json({ success: true, msg: "Clinic deleted successfully", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete clinic!" })
    } catch (error) {
        console.error("Error in deleteClinic:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}