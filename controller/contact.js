const Contact = require("../model/Contact");

exports.getAllContact = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await Contact.findById(id);
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res
        .status(404)
        .json({ success: false, msg: "Contact not found!" });
    }
    const result = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, msg: "All contact", result });
  } catch (error) {
    console.log("error on getAllContact: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.contactPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const result = await Contact.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    const totalDocuments = await Contact.countDocuments();
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
    return res.status(404).json({ success: false, msg: "Contact not found!" });
  } catch (error) {
    console.log("error on contactPagination: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addCotactForm = async (req, res) => {
  const name = req.body?.name;
  const email = req.body?.email;
  const mobile = req.body?.mobile;
  const message = req.body?.message;
  const reason = req.body?.reason;
  const subject = req.body?.subject;

  try {
    const result = await Contact.create({
      name,
      email,
      mobile,
      message,
      reason,
      subject,
    });
    return res
      .status(200)
      .json({ success: true, msg: "Contact form added successfully!", result });
  } catch (error) {
    console.log("error on addCotactForm: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updateContact = async (req, res) => {
  const id = req.params?.id;

  const name = req.body?.name;
  const email = req.body?.email;
  const mobile = req.body?.mobile;
  const message = req.body?.message;
  const reason = req.body?.reason;
  const subject = req.body?.subject;
  try {
    const checkContact = await Contact.findById(id);
    if (!checkContact) {
      return res
        .status(404)
        .json({ success: false, msg: "Contact not found!" });
    }
    if (name) checkContact.name = name;
    if (email) checkContact.email = email;
    if (mobile) checkContact.mobile = mobile;
    if (message) checkContact.message = message;
    if (reason) checkContact.reason = reason;
    if (subject) checkContact.subject = subject;
    const result = await checkContact.save();
    if (result) {
      return res
        .status(200)
        .json({ success: true, msg: "Contact updated successfully!", result });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update contact!" });
  } catch (error) {
    console.log("error on updateContact: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  const id = req.params?.id;
  try {
    const checkContact = await Contact.findById(id);
    if (!checkContact) {
      return res
        .status(404)
        .json({ success: false, msg: "Contact not found!" });
    }
    const result = await Contact.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({ success: true, msg: "Contact deleted successfully!", result });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to delete contact!" });
  } catch (error) {
    console.log("error on deleteContact: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
