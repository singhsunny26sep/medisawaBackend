const Plan = require("../model/Plan");

exports.getPlans = async (req, res) => {
  const id = req.params?.id;
  try {
    if (id) {
      const result = await Plan.findById(id);
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res.status(404).json({ success: false, msg: "Plan not found!" });
    }
    const result = await Plan.find().sort({ createdAt: -1 });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res.status(404).json({ success: false, msg: "No plans found!" });
  } catch (error) {
    console.log("error on getPlans: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.addPlan = async (req, res) => {
  // console.log("req.body: ", req.body);

  const planType = req.body?.planType;
  const planCost = req.body?.planCost;
  const name = req.body?.name;
  const discount = req.body?.discount;
  const discountType = req.body?.discountType;
  const description = req.body?.description;

  try {
    if (!planType || !planCost || !name) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required fields!" });
    }
    if (planCost < 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Plan cost cannot be negative!" });
    }
    if (discount) {
      if (discount < 0) {
        return res
          .status(400)
          .json({ success: false, msg: "Discount cannot be negative!" });
      }
    }
    const checkPlan = await Plan.findOne({ name });
    if (checkPlan) {
      return res
        .status(400)
        .json({ success: false, msg: "Plan already exists!" });
    }
    const newPlan = new Plan({ planType, planCost, name });
    if (discountType) newPlan.discountType = discountType;
    if (discount) newPlan.discount = discount;
    if (description) newPlan.description = description;
    const result = await newPlan.save();
    if (result) {
      return res
        .status(201)
        .json({ success: true, msg: "Plan added successfully!", data: result });
    }
    return res.status(400).json({ success: false, msg: "Failed to add plan!" });
  } catch (error) {
    console.log("error on addPlan: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  const id = req.params?.id;
  const planType = req.body?.planType;
  const planCost = req.body?.planCost;
  const name = req.body?.name;
  const discount = req.body?.discount;
  const discountType = req.body?.discountType;
  const description = req.body?.description;

  try {
    const checkPlan = await Plan.findById(id);
    if (!checkPlan) {
      return res.status(404).json({ success: false, msg: "Plan not found!" });
    }
    const checkByName = await Plan.findOne({
      name: name, // Match the name
      _id: { $ne: id }, // Ensure the _id is not equal to the given id
    });
    if (checkByName) {
      return res
        .status(400)
        .json({
          success: false,
          msg: `Plan with the same name ${name} already exists!`,
        });
    }
    if (planCost) checkPlan.planCost = planCost;
    if (planType) checkPlan.planType = planType;
    if (name) checkPlan.name = name;
    if (discountType) checkPlan.discountType = discountType;
    if (discount) checkPlan.discount = discount;
    if (description) checkPlan.description = description;

    const result = await checkPlan.save();
    if (result) {
      return res
        .status(200)
        .json({
          success: true,
          msg: "Plan updated successfully!",
          data: result,
        });
    }
    return res
      .status(400)
      .json({ success: false, msg: "Failed to update plan!" });
  } catch (error) {
    console.log("error on updatePlan: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  const id = req.params?.id;
  try {
    const result = await Plan.findByIdAndDelete(id);
    if (result) {
      return res
        .status(200)
        .json({ success: true, msg: `Plan deleted successfully!` });
    }
    return res.status(404).json({ success: false, msg: "Plan not found!" });
  } catch (error) {
    console.log("error on deletePlan: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
