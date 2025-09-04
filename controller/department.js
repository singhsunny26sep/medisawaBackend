const Department = require("../model/Department")
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage")

exports.getDepartments = async (req, res) => {
    // console.log("==================== getDepartments =================");
    // console.log("req.params: ", req.params);


    const id = req.params?.id
    try {
        if (id) {
            const department = await Department.findById(id)
            if (department) {
                return res.status(200).json({ success: true, result: department })
            }
            return res.status(404).json({ success: false, msg: "Department not found!" })
        }
        const result = await Department.find().sort({ createdAt: -1 })
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Departments not found!" })
    } catch (error) {
        console.log("error on getDepartments: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.getAllPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;


    try {

        // Fetch paginated results
        const result = await Department.find()
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip(skip)
            .limit(limit);

        // Count the total documents
        const totalDocuments = await Department.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalDocuments / limit);

        if (result.length > 0) {
            return res.status(200).json({ success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, });
        }
        return res.status(404).json({ success: false, msg: "No departments found!" });
    } catch (error) {
        console.log("error on getAllPagination: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message });
    }
};


exports.addDepartment = async (req, res) => {
    const name = req.body?.name
    const description = req.body?.description
    const image = req.files?.image
    try {
        if (!name) {
            return res.status(400).json({ success: false, msg: "Name is required!" })
        }
        if (!image) {
            return res.status(400).json({ success: false, msg: "Image is required!" })
        }
        const checkDepartments = await Department.findOne({ name })
        if (checkDepartments) {
            return res.status(400).json({ success: false, msg: "Department already exists!" })
        }
        let imageUrl = await uploadToCloudinary(image.tempFilePath)
        const newDepartment = new Department({ name, description, image: imageUrl, })
        const result = await newDepartment.save()
        if (result) {
            return res.status(400).json({ success: true, msg: "Department added successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to add department!" })
    } catch (error) {
        // Check if the error is a Mongoose validation error
        // console.log("error: ", error);

        /* if (error.name === 'ValidationError') {
            // Extract validation error messages
            const errors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
            }));

            // Send a user-friendly error response
            console.log("errors: ", errors);

            return res.status(400).json({ msg: errors, success: false });
        } */
        console.log("error on addDepartment: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.updateDepartment = async (req, res) => {

    const id = req.params?.id
    const name = req.body?.name
    const description = req.body?.description
    const image = req.files?.image
    try {
        if (!id) {
            return res.status(400).json({ success: false, msg: "Id is required!" })
        }
        const checkDepartments = await Department.findById(id)
        if (!checkDepartments) {
            return res.status(404).json({ success: false, msg: "Department not found!" })
        }
        if (image) {
            if (checkDepartments.image) {
                await deleteFromCloudinary(checkDepartments?.image)
            }
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            checkDepartments.image = imageUrl
        }
        if (name) checkDepartments.name = name
        if (description) checkDepartments.description = description

        const result = await checkDepartments.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Department updated successfully!", data: result })
        }
        return res.status(400).json({ success: false, msg: "Failed to update department!" })
    } catch (error) {
        console.log("error on updateDepartment: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}

exports.deleteDepartment = async (req, res) => {
    const id = req.params?.id
    try {
        const checkDepartments = await Department.findById(id)
        if (!checkDepartments) {
            return res.status(404).json({ success: false, msg: "Department not found!" })
        }
        if (checkDepartments.image) {
            await deleteFromCloudinary(checkDepartments?.image)
        }
        const result = await Department.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Department deleted successfully!" })
        }
        return res.status(400).json({ success: false, msg: "Failed to delete department!" })
    } catch (error) {
        console.log("error on deleteDepartment: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}