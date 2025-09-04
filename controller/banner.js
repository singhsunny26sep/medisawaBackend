const Banner = require("../model/Banner");
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage");


exports.getAllBanner = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const result = await Banner.findById(id)
            if (result) {
                return res.status(200).json({ success: true, result })
            }
            return res.status(404).json({ success: false, msg: "Banner not found!" })
        }
        const result = await Banner.find().sort({ createdAt: -1 })
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Banners not found!" })
    } catch (error) {
        console.log("error on getAllBanner: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getAllWithPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    try {
        const result = await Banner.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalDocuments = await Banner.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.status(200).json({ success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, });
        }
        return res.status(404).json({ success: false, msg: "Banners not found!" });
    } catch (error) {
        console.log("error on getAllWithPagination: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.addBanner = async (req, res) => {
    const title = req.body?.title
    const description = req.body?.description
    const image = req.files?.image
    try {

        const checkBanner = await Banner.findOne({ title })
        if (checkBanner) {
            return res.status(400).json({ success: false, msg: "Banner already exists!" })
        }

        const banner = new Banner({ title, description })
        if (image) {
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            banner.image = imageUrl
        }

        const result = await banner.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Banner added successfully!", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to add Banner!" })
    } catch (error) {
        console.log("error on addBanner: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.updateBanner = async (req, res) => {

    const id = req.params?.id

    const title = req.body?.title
    const description = req.body?.description
    const image = req.files?.image
    try {
        const checkBanner = await Banner.findById(id)
        if (!checkBanner) {
            return res.status(404).json({ success: false, msg: "Banner not found!" })
        }
        if (image) {
            if (checkBanner.image) {
                await deleteFromCloudinary(checkBanner?.image)
            }
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            checkBanner.image = imageUrl
        }
        if (title) checkBanner.title = title
        if (description) checkBanner.description = description

        const result = await checkBanner.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Banner updated successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to update Banner!" })

    } catch (error) {
        console.log("error on updateBanner: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.deleteBanner = async (req, res) => {
    const id = req.params?.id
    try {
        const checkBanner = await Banner.findById(id)
        if (!checkBanner) {
            return res.status(404).json({ success: false, msg: "Banner not found!" })
        }
        if (checkBanner.image) {
            await deleteFromCloudinary(checkBanner?.image)
        }
        const result = await Banner.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Banner deleted successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete Banner!" })
    } catch (error) {
        console.log("error on deleteBanner: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}