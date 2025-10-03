const Specialization = require("../model/Specialization");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");

exports.getSpecialization = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const department = await Specialization.findById(id);
      if (department) {
        return res.status(200).json({ success: true, result: department });
      }
      return res
        .status(404)
        .json({ success: false, msg: "Specialization not found!" });
    }
    const result = await Specialization.find().sort({ createdAt: -1 });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Specialization not found!" });
  } catch (error) {
    console.log("error on getSpecialization: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllSpecializationPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;
    // Fetch paginated results
    const result = await Specialization.find()
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip)
      .limit(limit);
    // Count the total documents
    const totalDocuments = await Specialization.countDocuments();
    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);
    if (result.length > 0) {
      return res
        .status(200)
        .json({
          success: true,
          result,
          pagination: { totalDocuments, totalPages, currentPage: page, limit },
        });
    }
    return res
      .status(404)
      .json({ success: false, msg: "No specialization found!" });
  } catch (error) {
    console.log("error on getAllSpecializationPagination: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addSpecialization = async (req, res) => {
  const name = req.body?.name;
  const description = req.body?.description;
  const image = req.files?.image;
  try {
    if (!name) {
      return res.status(400).json({ success: false, msg: "Name is required!" });
    }
    if (!image) {
      return res
        .status(400)
        .json({ success: false, msg: "Image is required!" });
    }
    const checkDepartments = await Specialization.findOne({ name });
    if (checkDepartments) {
      return res
        .status(400)
        .json({ success: false, msg: "Specialization already exists!" });
    }
    let imageUrl = await uploadToCloudinary(image.tempFilePath);
    const newDepartment = new Specialization({
      name,
      description,
      image: imageUrl,
    });
    const result = await newDepartment.save();
    if (result) {
      return res
        .status(201)
        .json({
          success: true,
          msg: "Specialization added successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to add specialization!" });
  } catch (error) {
    console.log("error on addSpecialization: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updateSpecialization = async (req, res) => {
  const id = req.params?.id;
  const name = req.body?.name;
  const description = req.body?.description;
  const image = req.files?.image;
  try {
    if (!id) {
      return res.status(400).json({ success: false, msg: "Id is required!" });
    }
    const checkDepartments = await Specialization.findById(id);
    if (!checkDepartments) {
      return res
        .status(404)
        .json({ success: false, msg: "Specialization not found!" });
    }
    if (image) {
      if (checkDepartments.image) {
        await deleteFromCloudinary(checkDepartments?.image);
      }
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      checkDepartments.image = imageUrl;
    }
    if (name) checkDepartments.name = name;
    if (description) checkDepartments.description = description;

    const result = await checkDepartments.save();
    if (result) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "Specialization updated successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update specialization!" });
  } catch (error) {
    console.log("error on updateSpecialization: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deleteSpecialization = async (req, res) => {
  const id = req.params?.id;
  try {
    const checkDepartments = await Specialization.findById(id);
    if (!checkDepartments) {
      return res
        .status(404)
        .json({ success: false, msg: "Specialization not found!" });
    }
    if (checkDepartments.image) {
      await deleteFromCloudinary(checkDepartments?.image);
    }
    const result = await Specialization.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({ success: true, msg: "Specialization deleted successfully!" });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to delete specialization!" });
  } catch (error) {
    console.log("error on deleteSpecialization: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
