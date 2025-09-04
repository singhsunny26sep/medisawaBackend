const Category = require("../model/Category");
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage");


exports.getAllCategory = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const result = await Category.findById(id)/* .populate("subCategory") */
            if (result) {
                return res.status(200).json({ success: true, result })
            }
            return res.status(404).json({ success: false, msg: "Category not found!" })
        }
        const result = await Category.find().sort({ createdAt: -1 })/* .populate("subCategory") */
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Categories not found!" })
    } catch (error) {
        console.log("error on getAllCategory: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getAllWithPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    try {
        const result = await Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit)/* .populate("subCategory") */
        const totalDocuments = await Category.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.status(200).json({ success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, });
        }
        return res.status(404).json({ success: false, msg: "Categories not found!" });
    } catch (error) {
        console.log("error on getAllWithPagination: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

// for website menu
exports.getSubacategory = async (req, res) => {
    try {
        const result = await Category.aggregate([
            {
                $lookup: {
                    from: 'subcategories',        // name of the SubCategory collection (lowercase + plural)
                    localField: '_id',            // field from Category
                    foreignField: 'category',     // field from SubCategory
                    as: 'subcategories'           // name of the new array field
                }
            }
        ]);

        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Categories not found!" })
    } catch (error) {
        console.log("error on getSubacategory: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.addCategory = async (req, res) => {
    const title = req.body?.title
    const description = req.body?.description
    const image = req.files?.image
    try {

        const checkCategory = await Category.findOne({ title })
        if (checkCategory) {
            return res.status(400).json({ success: false, msg: "Category already exists!" })
        }

        const category = new Category({ title, description })
        if (image) {
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            category.image = imageUrl
        }

        const result = await category.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Category added successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to add category!" })
    } catch (error) {
        console.log("error on addCategory: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.updateCategory = async (req, res) => {

    const id = req.params?.id

    const title = req.body?.title
    const description = req.body?.description
    const image = req.files?.image
    try {
        const checkCategory = await Category.findById(id)
        if (!checkCategory) {
            return res.status(404).json({ success: false, msg: "Category not found!" })
        }
        if (image) {
            if (checkCategory.image) {
                await deleteFromCloudinary(checkCategory?.image)
            }
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            checkCategory.image = imageUrl
        }
        if (title) checkCategory.title = title
        if (description) checkCategory.description = description

        const result = await checkCategory.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Category updated successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to update category!" })

    } catch (error) {
        console.log("error on updateCategory: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.deleteCategory = async (req, res) => {
    const id = req.params?.id
    try {
        const checkCategory = await Category.findById(id)
        if (!checkCategory) {
            return res.status(404).json({ success: false, msg: "Category not found!" })
        }
        if (checkCategory.image) {
            await deleteFromCloudinary(checkCategory?.image)
        }
        const result = await Category.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Category deleted successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete category!" })

    } catch (error) {
        console.log("error on deleteCategory: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}