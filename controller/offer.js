const Offer = require("../model/Offer");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../service/uploadImage");

exports.getAllOffer = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await Offer.findById(id);
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res.status(404).json({ success: false, msg: "Offer not found!" });
    }
    const result = await Offer.find().sort({ createdAt: -1 });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "Offers not found!" });
  } catch (error) {
    console.log("error on getAllOffer: ", error);
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
    const result = await Offer.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalDocuments = await Offer.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);
    if (result) {
      return res.status(200).json({
        success: true,
        result,
        pagination: { totalDocuments, totalPages, currentPage: page, limit },
      });
    }
    return res.status(404).json({ success: false, msg: "Offers not found!" });
  } catch (error) {
    console.log("error on getAllWithPagination: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addOffer = async (req, res) => {
  const title = req.body?.title;
  const description = req.body?.description;
  const discount = req.body?.discount;
  const discountType = req.body?.discountType;
  const image = req.files.image;
  try {
    const checkOffer = await Offer.findOne({ title });
    if (checkOffer) {
      return res
        .status(400)
        .json({ success: false, msg: "Offer already exists!" });
    }
    const offer = new Offer({ title, description, discount, discountType });
    if (image) {
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      offer.image = imageUrl;
    }
    const result = await offer.save();
    if (result) {
      return res.status(200).json({
        success: true,
        msg: "Offer added successfully!",
        offer: result,
      });
    }
  } catch (error) {
    console.log("error on addOffer: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  const id = req.params?.id;
  const title = req.body?.title;
  const description = req.body?.description;
  const discount = req.body?.discount;
  const discountType = req.body?.discountType;
  const image = req.files.image;
  try {
    const checkOffer = await Offer.findById(id);
    if (!checkOffer) {
      return res.status(404).json({ msg: "No offer found!", success: false });
    }
    if (title) checkOffer.title = title;
    if (description) checkOffer.description = description;
    if (discount) checkOffer.discount = discount;
    if (discountType) checkOffer.discountType = discountType;
    if (isActive) checkOffer.isActive = isActive;
    if (image) {
      if (checkOffer.image) {
        await deleteFromCloudinary(checkBanner?.image);
      }
      let imageUrl = await uploadToCloudinary(image.tempFilePath);
      checkOffer.image = imageUrl;
    }
    const result = await checkOffer.save();
    if (result) {
      return res.status(200).json({
        msg: "Offer updated successfully!",
        data: result,
        success: true,
      });
    }
    return res
      .status(400)
      .json({ msg: "Failed to update offer!", success: false });
  } catch (error) {
    console.log("error on updateOffer: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  const id = req.params?.id;
  try {
    const checkOffer = await Offer.findById(id);
    if (!checkOffer) {
      return res.status(404).json({ msg: "No offer found!", success: false });
    }
    if (checkOffer.image) {
      await deleteFromCloudinary(checkOffer?.image);
    }
    const result = await Offer.findByIdAndDelete(id);
    if (result) {
      return res.status(200).json({
        msg: "Offer deleted successfully!",
        data: result,
        success: true,
      });
    }
    return res
      .status(400)
      .json({ msg: "Failed to delete offer!", success: false });
  } catch (error) {
    console.log("error on deleteOffer: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
