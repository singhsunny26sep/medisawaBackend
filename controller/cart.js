const Cart = require("../model/Cart");
const Doctor = require("../model/Doctor");
const User = require("../model/User");

exports.getAllCartData = async (req, res) => {
    const id = req?.payload?._id;
    try {
        const result = await Cart.find({ userId: id }).populate({
            path: "doctorId", populate: [
                { path: 'department', select: 'name' }, // Populate the department field inside doctor
                { path: 'specialization', select: 'name' } // Populate the specialization field inside doctor
            ]
        })
        if (!result) {
            return res.status(404).json({ success: false, msg: "No cart found!" });
        }
        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Error on getAllCartData: ", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}

exports.addToCart = async (req, res) => {
    const doctorId = req.params?.id; //doctor id
    const userId = req?.payload?._id;
    try {
        // Check if user exists
        const checkUser = await User.findById(userId);
        if (!checkUser) {
            return res.status(404).json({ success: false, msg: 'User not found!' });
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, msg: 'Doctor not found!' });
        }

        const checkCart = await Cart.findOne({ userId, doctorId })
        if (checkCart) {
            await Cart.findByIdAndDelete(checkCart?._id)
            return res.status(200).json({ success: true, msg: 'Doctor removed from cart!' });
        }
        const result = await Cart.create({ userId, doctorId })
        if (result) {
            return res.status(200).json({ success: true, msg: 'Doctor added to cart!' });
        }
        return res.status(400).json({ success: false, msg: 'Failed to add doctor to cart!' });
    } catch (error) {
        console.error("Error on addToCart: ", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}

exports.removeFromCart = async (req, res) => {
    const doctorId = req.params?.id; //doctor id
    const userId = req?.payload?._id;
    // console.log("doctorId: ", doctorId);

    try {
        // Check if user exists
        const checkUser = await User.findById(userId);
        // console.log("checkUser: ", checkUser);

        if (!checkUser) {
            return res.status(404).json({ success: false, msg: 'User not found!' });
        }
        // Check if doctor exists
        const doctor = await User.findOne({ userId: doctorId })
        // console.log("doctor: ", doctor);

        if (!doctor) {
            return res.status(404).json({ success: false, msg: 'Doctor not found!' });
        }
        /* const checkCart = await Cart.findOne({ userId, doctorId })
        if (checkCart) {
            await Cart.findByIdAndDelete(checkCart?._id)
            return res.status(200).json({ success: true, msg: 'Doctor removed from cart!' });
        } */
        /* const result = await Cart.create({ userId, doctorId })
        if (result) {
            return res.status(200).json({ success: true, msg: 'Doctor added to cart!' });
        }
        return res.status(400).json({ success: false, msg: 'Failed to add doctor to cart!' }); */
    } catch (error) {
        console.error("Error on removeFromCart: ", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error", error: error.message });
    }
}