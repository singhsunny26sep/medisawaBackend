const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Image = require("../model/Image");
const Medicine = require("../model/Medicine");
const Size = require("../model/Size");
const SubCategory = require("../model/SubCategory");
const { uploadToCloudinary } = require("../service/uploadImage");

exports.getAllMedicine = async (req, res) => {
    const id = req.params?.id

    try {
        if (id) {
            const result = await Medicine.findById(id).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
            if (result) {
                return res.status(200).json({ msg: "Ok", success: true, result })
            }
            return res.status(404).json({ msg: 'No medicine found!', success: false })
        }
        const result = await Medicine.find().sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getAllMedicine:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.filterMedicine = async (req, res) => {
    const prize = req.query?.prize
    try {
        let filter = {}
        if (prize) {
            filter.prize = prize
        }

        const result = await Medicine.find(filter).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getAllMedicine:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}


exports.getWithPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    try {
        const result = await Medicine.find().limit(limit).skip(skip).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        const totalDocuments = await Medicine.countDocuments()
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getWithPagination:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.serachByTitle = async (req, res) => {
    const title = req.query?.title
    try {
        const result = await Medicine.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: 'ok', success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in serachByTitle:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.getOfferMedicines = async (req, res) => {
    try {
        // const result = await Medicine.find({ isOffer: true }).populate("images", "-__v").sort({ createdAt: -1 }).select("-__v")
        const result = await Medicine.find({ isOffer: true }).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getOfferMedicines:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.getMedicinesByCategory = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await Medicine.find({ category: id }).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getMedicinesByCategory:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}
exports.getSubCategoryMedicines = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await Medicine.find({ subCategory: id }).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getMedicinesByCategory:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.getByBrandMedicines = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await Medicine.find({ brand: id }).sort({ createdAt: -1 }).populate("images", "-__v").populate("category", "-__v").populate("subCategory", "-__v").populate("brand", "-__v").populate("size", "-__v")
        if (result) {
            return res.status(200).json({ msg: "Ok", success: true, result })
        }
        return res.status(404).json({ msg: 'No medicine found!', success: false })
    } catch (error) {
        console.error("Error in getMedicinesByCategory:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}


// Add Medicine
exports.addMedicine = async (req, res) => {
    const { title, description, unit, price, discount, manufacturer, quntity, inStock, category, subCategory, brand, isOffer, offer, offerType } = req.body;

    const images = req.files?.images;
    const size = req.body?.size;

    try {
        // Validate references
        if (category && !(await Category.findById(category))) {
            return res.status(404).json({ msg: 'No category found!', success: false });
        }
        if (subCategory && !(await SubCategory.findById(subCategory))) {
            return res.status(404).json({ msg: 'No subcategory found!', success: false });
        }
        if (brand && !(await Brand.findById(brand))) {
            return res.status(404).json({ msg: 'No brand found!', success: false });
        }

        const medicine = new Medicine({ title, description, unit, price, discount, manufacturer, quntity, inStock, isOffer, offer, offerType, category, subCategory, brand });

        // Handle Images
        if (images) {
            let imageIds = [];
            for (let i = 0; i < images.length; i++) {
                let imageUrl = await uploadToCloudinary(images[i].tempFilePath);
                const imageDoc = await Image.create({ image: imageUrl, medicine: medicine._id, });
                imageIds.push(imageDoc._id);
            }
            medicine.images = imageIds;
        }

        // Handle Sizes
        if (size) {
            let sizes = [];
            const parsedSize = typeof size === 'string' ? JSON.parse(size) : size;
            for (let i = 0; i < parsedSize.length; i++) {
                let sizeObj = await Size.create({
                    size: parsedSize[i].size,
                    unit: parsedSize[i].unit,
                    price: parsedSize[i].price,
                    quntity: parsedSize[i].quntity,
                    discount: parsedSize[i].discount,
                    discountType: parsedSize[i].discountType,
                    medicine: medicine._id
                })
                sizes.push(sizeObj);
            }
            medicine.size = sizes;
        }

        const result = await medicine.save();
        return res.status(200).json({ success: true, msg: "Medicine added successfully!", result });

    } catch (error) {
        console.error("Error in addMedicine:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
};


// Update Medicine
exports.updateMedicine = async (req, res) => {
    const medicineId = req.params.id;
    const { title, description, unit, price, discount, manufacturer, quntity, inStock, category, subCategory, brand, isOffer, offer, offerType } = req.body;

    // const images = req.files?.images;
    // const size = req.body?.size;

    try {
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ success: false, msg: "Medicine not found!" });
        }

        // Update basic fields
        if (title) medicine.title = title;
        if (description) medicine.description = description;
        if (unit) medicine.unit = unit;
        if (price) medicine.price = price;
        if (discount) medicine.discount = discount;
        if (manufacturer) medicine.manufacturer = manufacturer;
        if (typeof quntity !== "undefined") medicine.quntity = quntity;
        if (typeof inStock !== "undefined") medicine.inStock = inStock;
        if (category) medicine.category = category;
        if (subCategory) medicine.subCategory = subCategory;
        if (brand) medicine.brand = brand;
        if (typeof isOffer !== "undefined") medicine.isOffer = isOffer;
        if (offer) medicine.offer = offer;
        if (offerType) medicine.offerType = offerType;

        // Handle Images
        /* if (images) {
            // Delete old images from Cloudinary
            if (medicine.images.length > 0) {
                const oldImages = await Image.find({ _id: { $in: medicine.images } });
                for (let img of oldImages) {
                    await deleteFromCloudinary(img.image);
                    await img.remove();
                }
            }
            let newImageIds = [];
            for (let i = 0; i < images.length; i++) {
                let imageUrl = await uploadToCloudinary(images[i].tempFilePath);
                const imageDoc = await Image.create({ image: imageUrl, medicine: medicine._id });
                newImageIds.push(imageDoc._id);
            }
            medicine.images = newImageIds;
        } */

        // Handle Sizes
        /* if (size) {
            // Remove old sizes
            if (medicine.size.length > 0) {
                await Size.deleteMany({ _id: { $in: medicine.size } });
            }
            let newSizeIds = [];
            for (let i = 0; i < size.length; i++) {
                const sizeObj = await Size.create({
                    size: size[i].size,
                    unit: size[i].unit,
                    price: size[i].price,
                    quntity: size[i].quntity,
                    discount: size[i].discount,
                    medicine: medicine._id,
                });
                newSizeIds.push(sizeObj._id);
            }
            medicine.size = newSizeIds;
        } */

        const updatedMedicine = await medicine.save();
        return res.status(200).json({ success: true, msg: "Medicine updated successfully!", result: updatedMedicine });

    } catch (error) {
        console.error("Error in updateMedicine:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
};

// ============================================================================== image operations ========================================================

exports.updateMedicineImage = async (req, res) => {
    const id = req.params?.id //id should be of image
    const image = req.files?.image
    try {
        const checkImage = await Image.findById(id)
        if (!checkImage) {
            return res.status(404).json({ success: false, msg: "Image not found!" })
        }
        if (checkImage.image) {
            await deleteFromCloudinary(checkImage?.image)
        }
        let imageUrl = await uploadToCloudinary(image.tempFilePath)
        checkImage.image = imageUrl
        const result = await checkImage.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Image updated successfully", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to update image!" })
    } catch (error) {
        console.error("Error in updateMedicineImage:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.deleteMedicineImage = async (req, res) => {
    const id = req.params?.id //id should be of image
    try {
        const checkImage = await Image.findById(id)
        if (!checkImage) {
            return res.status(404).json({ success: false, msg: "Image not found!" })
        }
        // const checkMedicine = await Medicine.findById(checkImage.medicine)
        await Medicine.findByIdAndUpdate(checkImage?.medicine, { $pull: { images: id } })
        if (checkImage.image) {
            await deleteFromCloudinary(checkImage?.image)
        }
        const result = await checkImage.remove()
        if (result) {
            return res.status(200).json({ success: true, msg: "Image deleted successfully", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete image!" })
    } catch (error) {
        console.error("Error in deleteMedicineImage:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.addMedicineImage = async (req, res) => {
    const id = req.params?.id //id should be of medicine
    const image = req.files?.image
    try {
        const checkMedicine = await Medicine.findById(id)
        if (!checkMedicine) {
            return res.status(404).json({ success: false, msg: "Medicine not found!" })
        }
        let imageUrl = await uploadToCloudinary(image.tempFilePath)
        const imageDoc = await Image.create({ image: imageUrl, medicine: id })
        checkMedicine.images.push(imageDoc._id)
        const result = await checkMedicine.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Image added successfully", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to add image!" })
    } catch (error) {
        console.error("Error in addMedicineImage:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}


// ============================================================================== image operations ========================================================
// ============================================================================== size operations ========================================================

exports.addMedicineSize = async (req, res) => {
    const id = req.params?.id

    const size = req.body?.size
    const unit = req.body?.unit
    const price = req.body?.price
    const quntity = req.body?.quntity
    const discount = req.body?.discount
    const discountType = req.body?.discountType

    try {
        const checkMedicine = await Medicine.findById(id)
        if (!checkMedicine) {
            return res.status(404).json({ msg: 'No medicine found!', success: false });
        }

        const sizeObj = await Size.create({ size, unit, price, quntity, discount, discountType, medicine: id, });
        checkMedicine.size.push(sizeObj._id);
        const result = await checkMedicine.save();
        if (result) {
            return res.status(200).json({ success: true, msg: "Size added successfully", result });
        }
        return res.status(400).json({ success: false, msg: "Failed to add size!" });
    } catch (error) {
        console.error("Error in addMedicineSize:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.updateMedicineSize = async (req, res) => {
    const id = req.params?.id

    const size = req.body?.size
    const unit = req.body?.unit
    const price = req.body?.price
    const quntity = req.body?.quntity
    const discount = req.body?.discount
    const discountType = req.body?.discountType

    try {
        const checkSize = await Size.findById(id)
        if (!checkSize) {
            return res.status(404).json({ msg: 'No medicine found!', success: false });
        }
        if (size) checkSize.size = size
        if (unit) checkSize.unit = unit
        if (price) checkSize.price = price
        if (quntity) checkSize.quntity = quntity
        if (discount) checkSize.discount = discount
        if (discountType) checkSize.discountType = discountType

        const result = await checkSize.save();
        if (result) {
            return res.status(200).json({ success: true, msg: "Size added successfully", result });
        }
        return res.status(400).json({ success: false, msg: "Failed to add size!" });
    } catch (error) {
        console.error("Error in updateMedicineSize:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

exports.deleteMedicineSize = async (req, res) => {
    const id = req.params?.id
    try {
        const checkSize = await Size.findById(id)
        if (!checkSize) {
            return res.status(404).json({ success: false, msg: "Size not found!" })
        }
        await Medicine.findByIdAndUpdate(checkSize?.medicine, { $pull: { size: id } })
        const result = await Size.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Size deleted successfully", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete size!" })
    } catch (error) {
        console.error("Error in deleteMedicineSize:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}

// ============================================================================== size operations ========================================================


// skin care and other category wise medicines

exports.getMedicinesByCategoriesWise = async (req, res) => {
    try {

        const result = await Category.aggregate([
            {
                $lookup: {
                    from: 'medicines',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            {
                $match: {
                    "products.0": { $exists: true } // Only categories with products
                }
            },
            {
                $unwind: "$products"
            },
            // Populate 'images'
            {
                $lookup: {
                    from: 'images',
                    localField: 'products.images',
                    foreignField: '_id',
                    as: 'products.images'
                }
            },
            /* {
                $lookup: {
                    from: 'images',
                    let: { imageIds: '$products.images' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$imageIds'] } } }
                    ],
                    as: 'products.images'
                }
            }, */
            // Populate 'size'
            {
                $lookup: {
                    from: 'sizes',
                    localField: 'products.size',
                    foreignField: '_id',
                    as: 'products.size'
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    image: { $first: "$image" },
                    products: { $push: "$products" }
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    image: 1,
                    products: {
                        $slice: ["$products", 10] // Optional: limit number of products
                    }
                }
            }
        ]);
        if (result) {
            return res.status(200).json({ success: true, result });
        }
        return res.status(400).json({ success: false, msg: "Failed to get medicines!" });
    } catch (error) {
        console.error("Error in getMedicinesByCategoriesWise:", error);
        return res.status(500).json({ success: false, msg: error.message, error: error });
    }
}