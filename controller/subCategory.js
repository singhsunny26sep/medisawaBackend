const Category = require("../model/Category");
const SubCategory = require("../model/SubCategory");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");

exports.getAllSubCategory = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await SubCategory.findById(id).populate("category");
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res
        .status(404)
        .json({ success: false, msg: "Category not found!" });
    }
    const result = await SubCategory.find()
      .sort({ createdAt: -1 })
      .populate("category");
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Categories not found!" });
  } catch (error) {
    console.log("error on getAllSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getAllWithPaginationSubCategory = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const skip = (page - 1) * limit;

  try {
    const result = await SubCategory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category");
    const totalDocuments = await SubCategory.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);
    if (result) {
      return res.status(200).json({
        success: true,
        result,
        pagination: { totalDocuments, totalPages, currentPage: page, limit },
      });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Categories not found!" });
  } catch (error) {
    console.log("error on getAllWithPaginationSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.getSubCategoryByCategory = async (req, res) => {
  const id = req.params?.id;

  console.log("id: ", id);

  try {
    const category = await Category.findById(id);
    console.log("categorye: ", category);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, msg: "Category not found!" });
    }
    const result = await SubCategory.find({ category: id })
      .sort({ createdAt: -1 })
      .populate("category");
    console.log("result: ", result);

    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(404)
      .json({ success: false, msg: "Categories not found!" });
  } catch (error) {
    console.log("error on getAllWithPaginationSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addSubCategory = async (req, res) => {
  const title = req.body?.title;
  const description = req.body?.description;
  const category = req.body?.category;
  const image = req.files?.image;
  try {
    const checkCategory = await SubCategory.findOne({ title });
    if (checkCategory) {
      return res
        .status(400)
        .json({ success: false, msg: "Category already exists!" });
    }

    const subcategory = new SubCategory({
      title,
      description,
      category: category,
    });
    if (image) {
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      subcategory.image = imageUrl;
    }

    // console.log("category: ", subcategory);

    const result = await subcategory.save();
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "Category added successfully!",
        data: result,
      });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to add category!" });
  } catch (error) {
    console.log("error on addSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  const id = req.params?.id;

  const title = req.body?.title;
  const description = req.body?.description;
  const category = req.body?.category;
  const image = req.files?.image;
  try {
    const checkCategory = await SubCategory.findById(id);
    if (!checkCategory) {
      return res
        .status(404)
        .json({ success: false, msg: "Category not found!" });
    }
    if (image) {
      if (checkCategory.image) {
        await deleteFromCloudinary(checkCategory?.image);
      }
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      checkCategory.image = imageUrl;
    }
    if (title) checkCategory.title = title;
    if (description) checkCategory.description = description;
    if (category) checkCategory.category = category;

    const result = await checkCategory.save();
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "Category updated successfully!",
        data: result,
      });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update category!" });
  } catch (error) {
    console.log("error on updateSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  const id = req.params?.id;
  try {
    const checkCategory = await SubCategory.findById(id);
    if (!checkCategory) {
      return res
        .status(404)
        .json({ success: false, msg: "Category not found!" });
    }
    if (checkCategory.image) {
      await deleteFromCloudinary(checkCategory?.image);
    }
    const result = await SubCategory.findByIdAndDelete(id);
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "Category deleted successfully!",
        data: result,
      });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to delete category!" });
  } catch (error) {
    console.log("error on deleteSubCategory: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
