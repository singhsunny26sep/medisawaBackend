const Notification = require("../model/Notification");



exports.getAllNotificationsPagination = async (req, res) => {
    const userId = req.payload?._id;


    const page = parseInt(req.query.page) || 1; // Get page number from request query
    const limit = parseInt(req.query.limit) || 10; // Number of records per page
    try {
        const result = await Notification.findOne({ receiverId: userId }).skip((page - 1) * limit).limit(limit);
        const totalDocuments = await Notification.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.json({ result, currentPage: page, totalPages, totalRecords: totalDocuments })
        }
        return res.status(404).json({ success: false, msg: "No notifications found!" });
    } catch (error) {
        console.log("error on getAllNotificationsPagination: ", error);
        return res.status(500).json({ error: error, success: false, msg: error.message })
    }
}