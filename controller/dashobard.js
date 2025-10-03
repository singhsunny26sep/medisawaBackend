const Sell = require("../model/Sell");
const {
  getBookingStats,
  getTodaysAppointments,
  getLabTestStatusCounts,
  getTodaysLabTests,
  getTotalRevenue,
  getTotalSellsAndRevenue,
  getTodaysSellsAndRevenue,
} = require("../utils/dashobard");

exports.dashobard = async (req, res) => {
  try {
    const [statusCounts, todaysAppointments] = await Promise.all([
      getBookingStats(),
      getTodaysAppointments(),
    ]);
    const [statusLabCounts, totalRevenue, todayStats] = await Promise.all([
      getLabTestStatusCounts(),
      getTotalRevenue(),
      getTodaysLabTests(),
    ]);
    const [totalStats, todayMedicineStats] = await Promise.all([
      getTotalSellsAndRevenue(),
      getTodaysSellsAndRevenue(),
    ]);
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
    return res.status(200).json({
      success: true,
      statusCounts,
      todaysAppointments,
      selles: analytics,
      testCountsByStatus: statusLabCounts, // paid: true/false with counts
      totalRevenue, // overall revenue
      today: {
        totalTests: todayStats.totalTestsToday,
        totalRevenue: todayStats.totalRevenueToday,
        tests: todayStats.tests, // optional: remove if not needed
      },
      totalSells: totalStats.totalSells,
      totalRevenue: totalStats.totalRevenue,
      todaySells: todayMedicineStats.todaySells,
      todayRevenue: todayMedicineStats.todayRevenue,
    });
  } catch (error) {
    console.log("error on dashobard: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};
