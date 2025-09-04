const Enquery = require("../model/Enquery")


exports.getEnquery = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const result = await Enquery.findById(id)
            if (result) {
                return res.status(200).json({ success: true, result })
            }
            return res.status(404).json({ success: false, msg: "Enquery not found!" })
        }
        const result = await Enquery.find().sort({ createdAt: -1 })
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Enquery not found!" })
    } catch (error) {
        console.log("error on getEnquery: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getAllByPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;
    try {
        const result = await Enquery.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalDocuments = await Enquery.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.status(200).json({ success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, });
        }
        return res.status(404).json({ success: false, msg: "Enquery not found!" });
    } catch (error) {
        console.log("error on getAllByPagination: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.addEnquery = async (req, res) => {
    const name = req.body?.name
    const email = req.body?.email
    const mobile = req.body?.mobile
    const location = req.body?.location
    const description = req.body?.description
    try {
        const result = await Enquery.create({ name, email, mobile, location, description })
        return res.status(200).json({ success: true, msg: 'Enquery added successfully!', result })
    } catch (error) {
        console.log("error on addEnquery: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.updateEnquery = async (req, res) => {
    const id = req.params?.id

    const name = req.body?.name
    const email = req.body?.email
    const mobile = req.body?.mobile
    const location = req.body?.location
    const description = req.body?.description

    try {
        const checkEnquery = await Enquery.findById(id)
        if (!checkEnquery) {
            return res.status(404).json({ success: false, msg: "Enquery not found!" })
        }
        if (name) checkEnquery.name = name
        if (email) checkEnquery.email = email
        if (mobile) checkEnquery.mobile = mobile
        if (location) checkEnquery.location = location
        if (description) checkEnquery.description = description
        const result = await checkEnquery.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Enquery updated successfully!", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to update enquery!" })
    } catch (error) {
        console.log("error on updateEnquery: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}


exports.deleteEnquery = async (req, res) => {
    const id = req.params?.id
    try {
        const result = await Enquery.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Enquery deleted successfully!", result })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete enquery!" })
    } catch (error) {
        console.log("error on deleteEnquery: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}