const Medicine = require("../model/Medicine");
const Sell = require("../model/Sell");
const Size = require("../model/Size");

exports.sellesSingle = async (req, res) => {
  const userId = req.payload?._id;
  const sizeId = req.body?.sizeId;
  const quntity = req.body?.quntity;
  const priceAtSale = req.body?.priceAtSale;
  try {
    const checkSize = await Size.findById(sizeId);
    if (!checkSize) {
      return res.status(404).json({ success: false, msg: "Size not found!" });
    }
    // console.log("checkSize", checkSize);

    const checkMedicine = await Medicine.findById(checkSize.medicine);
    // console.log("checkMedicine", checkMedicine);

    if (!checkMedicine) {
      return res
        .status(404)
        .json({ success: false, msg: "Medicine not found!" });
    }
    if (checkSize.quntity < quntity) {
      return res.status(400).json({
        success: false,
        msg: `Stock not enough! you can buy ${checkSize?.quntity}`,
      });
    }
    let amount = 0;
    if (checkSize?.discount > 0) {
      if (checkSize.discountType === "percentage") {
        amount =
          quntity * checkSize?.price -
          (quntity * checkSize?.price * checkSize?.discount) / 100;
      } else {
        amount = quntity * (checkSize?.price - checkSize?.discount);
      }
    } else {
      amount = quntity * checkSize?.price;
    }
    let offer = 0;
    if (checkMedicine.isOffer) {
      if (checkMedicine.offerType === "percentage") {
        offer = (amount * checkMedicine.offer) / 100;
      } else {
        offer = checkMedicine.offer;
      }
    }
    if (offer > 0) {
      amount -= offer;
    }
    checkSize.quntity -= quntity;
    await checkSize.save();

    checkMedicine.quntity -= quntity;
    await checkMedicine.save();

    // const result = await Sell.create({ userId, sizeId, quantity: quntity, priceAtSale, amount, });
    const result = await Sell.create({
      userId,
      sizeId,
      medicineId: checkMedicine._id,
      quantity: quntity,
      priceAtSale,
      amount,
    });
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(400)
      .json({ msg: "Something went wrong!", success: false });
  } catch (error) {
    console.error("Error in selles:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.sellMultiple = async (req, res) => {
  const userId = req.payload?._id;
  const items = req.body.items; // Array of { sizeId, quantity, priceAtSale }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, msg: "No items to sell" });
  }

  let sells = [];

  const session = await Size.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const { sizeId, quantity, priceAtSale } = item;

      const checkSize = await Size.findById(sizeId).session(session);
      if (!checkSize) throw new Error("Size not found");

      const checkMedicine = await Medicine.findById(checkSize.medicine).session(
        session
      );
      if (!checkMedicine) throw new Error("Medicine not found");

      if (checkSize.quntity < quantity) {
        throw new Error(
          `Not enough stock for ${checkMedicine.title} ${checkSize.size}. Available: ${checkSize.quntity}`
        );
      }

      // Calculate price
      let amount = 0;
      if (checkSize.discount > 0) {
        if (checkSize.discountType === "percentage") {
          amount =
            quantity * checkSize.price -
            (quantity * checkSize.price * checkSize.discount) / 100;
        } else {
          amount = quantity * (checkSize.price - checkSize.discount);
        }
      } else {
        amount = quantity * checkSize.price;
      }

      // Apply Medicine offer
      let offer = 0;
      if (checkMedicine.isOffer) {
        if (checkMedicine.offerType === "percentage") {
          offer = (amount * checkMedicine.offer) / 100;
        } else {
          offer = checkMedicine.offer;
        }
      }
      if (offer > 0) {
        amount -= offer;
      }

      // Update quantities
      checkSize.quntity -= quantity;
      await checkSize.save({ session });

      checkMedicine.quntity -= quantity;
      await checkMedicine.save({ session });

      // Create Sell record
      const sell = await Sell.create(
        [
          {
            userId,
            sizeId,
            medicineId: checkMedicine._id,
            quantity,
            priceAtSale,
            amount,
          },
        ],
        { session }
      );
      sells.push(sell[0]);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, result: sells });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Sell error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.salesAnalytics = async (req, res) => {
  try {
    const analytics = await Sell.aggregate([
      {
        $lookup: {
          from: "medicines",
          localField: "medicineId",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $group: {
          _id: "$medicine._id",
          title: { $first: "$medicine.title" },
          totalQuantitySold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$amount" },
          lastSoldAt: { $max: "$createdAt" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
    ]);
    return res.status(200).json({ success: true, result: analytics });
  } catch (error) {
    console.error("salesAnalytics error:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.getSingleUsersSellesHistory = async (req, res) => {
  const userId = req.payload?._id;
  try {
    const result = await Sell.find({ userId })
      .populate("sizeId", "-__v")
      .populate("medicineId", "-__v");
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(400)
      .json({ msg: "Something went wrong!", success: false });
  } catch (error) {
    console.error("Error in getSingleUsersSellesHistory:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.getSingleUsersSellesHistoryAdmin = async (req, res) => {
  const userId = req.params?.id;
  try {
    const result = await Sell.find({ userId })
      .populate("sizeId", "-__v")
      .populate("medicineId", "-__v");
    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(400)
      .json({ msg: "Something went wrong!", success: false });
  } catch (error) {
    console.error("Error in getSingleUsersSellesHistory:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};

exports.topSellingMedicines = async (req, res) => {
  try {
    const result = await Sell.aggregate([
      {
        $group: {
          _id: "$medicineId",
          totalSold: { $sum: "$quantity" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "images",
          let: { imageIds: "$medicine.images" },
          pipeline: [{ $match: { $expr: { $in: ["$_id", "$$imageIds"] } } }],
          as: "medicine.images",
        },
      },
      {
        $lookup: {
          from: "sizes",
          let: { sizeIds: "$medicine.size" },
          pipeline: [{ $match: { $expr: { $in: ["$_id", "$$sizeIds"] } } }],
          as: "medicine.size",
        },
      },
      {
        $project: {
          _id: 0,
          totalSold: 1,
          medicine: 1,
        },
      },
    ]);

    if (result) {
      return res.status(200).json({ success: true, result });
    }
    return res
      .status(400)
      .json({ msg: "Something went wrong!", success: false });
  } catch (error) {
    console.error("Error in topSellingMedicines:", error);
    return res.status(500).json({ success: false, msg: error.message });
  }
};
