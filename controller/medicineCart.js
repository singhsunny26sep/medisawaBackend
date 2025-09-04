const Medicine = require("../model/Medicine");
const MedicineCart = require("../model/MedicineCart");

// 🛒 Get User's Cart
exports.getMyCart = async (req, res) => {
    const userId = req.payload?._id;

    try {
        const cartItems = await MedicineCart.find({ userId }).sort({ createdAt: -1 }).populate("userId", "-password -__v -role -fcmToken -patientId").populate({
            path: 'medicineId',
            populate: [
                { path: 'images' }, // populate images of medicine
                { path: 'size' }    // populate size of medicine
            ]
        }).lean();

        if (cartItems.length === 0) {
            return res.status(200).json({ success: true, msg: 'Cart is empty!', data: [] });
        }

        return res.status(200).json({ success: true, msg: 'Cart fetched successfully!', result: cartItems });

    } catch (error) {
        console.error("Error in getMyCart:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


// ➕ Add to Cart
exports.addToMedicineCart = async (req, res) => {
    const userId = req.payload?._id;
    const { id, quantity } = req.body;

    try {
        const checkMed = await Medicine.findById(id);
        if (!checkMed) {
            return res.status(404).json({ success: false, msg: 'Medicine not found!' });
        }

        const existingCartItem = await MedicineCart.findOne({ userId, medicineId: id });
        if (existingCartItem) {
            existingCartItem.quantity = quantity;
            await existingCartItem.save();
            return res.status(200).json({ success: true, msg: 'Medicine quantity updated in cart!', result: existingCartItem });
        }

        const newCartItem = await MedicineCart.create({ userId, medicineId: id, quantity, });
        return res.status(200).json({ success: true, msg: 'Medicine added to cart!', result: newCartItem });

    } catch (error) {
        console.error("Error in addToMedicineCart:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};

// ➖ Remove from Cart
exports.removeFromMedicineCart = async (req, res) => {
    const userId = req.payload?._id;
    const { id } = req.params; // id = medicineId or cartItemId depending on how you want

    try {
        const deletedItem = await MedicineCart.findOneAndDelete({ userId, medicineId: id });

        if (!deletedItem) {
            return res.status(404).json({ success: false, msg: 'Medicine not found in cart!' });
        }

        return res.status(200).json({ success: true, msg: 'Medicine removed from cart!' });

    } catch (error) {
        console.error("Error in removeFromMedicineCart:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};

// 🔄 Update Cart Quantity
exports.updateMedicineCart = async (req, res) => {
    const userId = req.payload?._id;
    const { id, quantity } = req.body; // id = medicineId

    try {
        const cartItem = await MedicineCart.findOne({ userId, medicineId: id });

        if (!cartItem) {
            return res.status(404).json({ success: false, msg: 'Medicine not found in cart!' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        return res.status(200).json({ success: true, msg: 'Medicine quantity updated successfully!', data: cartItem });

    } catch (error) {
        console.error("Error in updateMedicineCart:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};