const Brand = require("../model/Brand");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");

exports.getAllBrand = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await Brand.findById(id);
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res.status(404).json({ success: false, msg: "Brand not found!" });
    }
    const result = await Brand.find().sort({ createdAt: -1 });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Categories not found!" });
  } catch (error) {
    console.log("error on getAllBrand: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllWithPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const skip = (page - 1) * limit;

  try {
    const result = await Brand.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalDocuments = await Brand.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);
    if (result) {
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
      .json({ success: false, msg: "Categories not found!" });
  } catch (error) {
    console.log("error on getAllWithPagination: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addBrand = async (req, res) => {
  const title = req.body?.title;
  const description = req.body?.description;
  const image = req.files?.image;
  try {
    const checkBrand = await Brand.findOne({ title });
    if (checkBrand) {
      return res
        .status(400)
        .json({ success: false, msg: "Brand already exists!" });
    }

    const brand = new Brand({ title, description });
    if (image) {
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      brand.image = imageUrl;
    }

    const result = await brand.save();
    if (result) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "Brand added successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to add Brand!" });
  } catch (error) {
    console.log("error on addBrand: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  const id = req.params?.id;

  const title = req.body?.title;
  const description = req.body?.description;
  const image = req.files?.image;
  try {
    const checkBrand = await Brand.findById(id);
    if (!checkBrand) {
      return res.status(404).json({ success: false, msg: "Brand not found!" });
    }
    if (image) {
      if (checkBrand.image) {
        await deleteFromCloudinary(checkBrand?.image);
      }
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      checkBrand.image = imageUrl;
    }
    if (title) checkBrand.title = title;
    if (description) checkBrand.description = description;

    const result = await checkBrand.save();
    if (result) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "Brand updated successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update Brand!" });
  } catch (error) {
    console.log("error on updateBrand: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  const id = req.params?.id;
  try {
    const checkBrand = await Brand.findById(id);
    if (!checkBrand) {
      return res.status(404).json({ success: false, msg: "Brand not found!" });
    }
    if (checkBrand.image) {
      await deleteFromCloudinary(checkBrand?.image);
    }
    const result = await Brand.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "Brand deleted successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to delete Brand!" });
  } catch (error) {
    console.log("error on deleteBrand: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
