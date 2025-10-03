const Booking = require("../model/Booking");
const LabTest = require("../model/LabTest");
const Sell = require("../model/Sell");

exports.getBookingStats = async () => {
  const statusCounts = await Booking.aggregate([
    {
      $group: {
        _id: "$bookingStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  return statusCounts; // Example: [{ _id: 'confirmed', count: 10 }, ...]
};

exports.getTodaysAppointments = async () => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const todaysAppointments = await Booking.find({
    appointmentDate: { $gte: start, $lte: end },
  })
    .populate("patientId")
    .populate("doctorId")
    .populate("userId");

  return todaysAppointments;
};

exports.getTotalRevenue = async () => {
  const result = await LabTest.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPaid" },
      },
    },
  ]);

  return result[0]?.totalRevenue || 0;
};

exports.getLabTestStatusCounts = async () => {
  return await LabTest.aggregate([
    {
      $group: {
        _id: "$paid", // true or false
        count: { $sum: 1 },
      },
    },
  ]);
};

exports.getTodaysLabTests = async () => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const todaysTests = await LabTest.find({
    createdAt: { $gte: start, $lte: end },
  });

  const totalRevenueToday = todaysTests.reduce(
    (sum, test) => sum + (test.totalPaid || 0),
    0
  );

  return {
    totalTestsToday: todaysTests.length,
    totalRevenueToday,
    tests: todaysTests,
  };
};

exports.getTotalSellsAndRevenue = async () => {
  const result = await Sell.aggregate([
    {
      $group: {
        _id: null,
        totalSells: { $sum: 1 },
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  return {
    totalSells: result[0]?.totalSells || 0,
    totalRevenue: result[0]?.totalRevenue || 0,
  };
};

exports.getTodaysSellsAndRevenue = async () => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const result = await Sell.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        todaySells: { $sum: 1 },
        todayRevenue: { $sum: "$amount" },
      },
    },
  ]);

  return {
    todaySells: result[0]?.todaySells || 0,
    todayRevenue: result[0]?.todayRevenue || 0,
  };
};

/* exports.getTotalSellsAndRevenue = async () => {
    const result = await Sell.aggregate([
        {
            $group: {
                _id: null,
                totalSells: { $sum: 1 },
                totalRevenue: { $sum: '$amount' } // ← this line gives total revenue
            }
        }
    ]);

    return {
        totalSells: result[0]?.totalSells || 0,
        totalRevenue: result[0]?.totalRevenue || 0
    };
}; */
