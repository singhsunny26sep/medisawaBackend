const LabTest = require("../model/LabTest")
const Package = require("../model/Package")
const PackageBook = require("../model/PackageBook")
const Patient = require("../model/Patient")
const User = require("../model/User")
const { uploadToCloudinary, deleteFromCloudinary } = require("../service/uploadImage")



exports.getAllPackages = async (req, res) => {
    const id = req.params?.id
    try {
        if (id) {
            const result = await Package.findById(id).populate("tests")
            if (result) {
                return res.status(200).json({ success: true, result });
            }
            return res.status(404).json({ success: false, msg: "No packages found!" });
        }
        const result = await Package.find().populate("tests").sort({ createdAt: -1 });
        if (result) {
            return res.status(200).json({ success: true, result });
        }
        return res.status(404).json({ success: false, msg: "No packages found!" });
    } catch (error) {
        console.log("error on getAllPackages: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}

exports.paginationPackage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const result = await Package.find().populate("tests").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalDocuments = await Package.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (result) {
            return res.status(200).json({ success: true, result, pagination: { totalDocuments, totalPages, currentPage: page, limit, }, });
        }
        return res.status(404).json({ success: false, msg: "No packages found!" });
    } catch (error) {
        console.log("error on paginationPackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}

exports.createPackage = async (req, res) => {

    const title = req.body?.title;
    const description = req.body?.description; // fixed mistake: was req.body?.title
    const price = req.body?.price;
    const discount = req.body?.discount;
    const discountType = req.body?.discountType;
    let tests = req.body.tests;

    // console.log("test:", tests);


    const image = req.files?.image;

    try {

        // Normalize `tests` to an array of ObjectIds
        if (typeof tests === 'string') {
            try {
                // Case: it's a stringified JSON array (e.g., '["id1","id2"]')
                const parsed = JSON.parse(tests);
                tests = Array.isArray(parsed) ? parsed : [parsed];
            } catch (err) {
                // Case: it's a single string ID (e.g., "id1")
                tests = [tests];
            }
        } else if (!Array.isArray(tests)) {
            // Case: it's not a string and also not an array
            tests = [tests];
        }

        const checkPackage = await Package.findOne({ title });
        if (checkPackage) {
            return res.status(400).json({ success: false, msg: "Package already exists!" });
        }

        if (price < 0) {
            return res.status(400).json({ success: false, msg: "Price cannot be negative!" });
        }

        if (discount && discount < 0) {
            return res.status(400).json({ success: false, msg: "Discount cannot be negative!" });
        }

        // Calculate discounted price
        let discountedPrice = 0
        if (discount && discountType === 'percentage') {
            discountedPrice = price - (price * discount / 100);
        } else if (discount && discountType === 'fixed') {
            discountedPrice = price - discount;
        }

        const newPackage = new Package({
            title,
            description,
            price: price,
            discount,
            discountType,
            discountedPrice: Math.max(discountedPrice, 0), // avoid negative prices
            tests
        });

        if (image) {
            const imageUrl = await uploadToCloudinary(image.tempFilePath);
            newPackage.image = imageUrl;
        }

        await newPackage.save();
        return res.status(201).json({ success: true, result: newPackage });

    } catch (error) {
        console.log("error on createPackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


exports.updatePackage = async (req, res) => {
    const id = req.params?.id


    const title = req.body?.title;
    const description = req.body?.description; // fixed mistake: was req.body?.title
    const price = req.body?.price;
    const discount = req.body?.discount;
    const discountType = req.body?.discountType;
    let tests = req.body.tests;

    const image = req.files?.image;
    try {

        // Normalize `tests` to an array of ObjectIds
        if (typeof tests === 'string') {
            try {
                // Case: it's a stringified JSON array (e.g., '["id1","id2"]')
                const parsed = JSON.parse(tests);
                tests = Array.isArray(parsed) ? parsed : [parsed];
            } catch (err) {
                // Case: it's a single string ID (e.g., "id1")
                tests = [tests];
            }
        } else if (!Array.isArray(tests)) {
            // Case: it's not a string and also not an array
            tests = [tests];
        }

        const checkPackage = await Package.findById(id);
        if (!checkPackage) {
            return res.status(404).json({ success: false, msg: "Package not found!" });
        }

        if (price < 0) {
            return res.status(400).json({ success: false, msg: "Price cannot be negative!" });
        }

        if (discount && discount < 0) {
            return res.status(400).json({ success: false, msg: "Discount cannot be negative!" });
        }
        if (title) checkPackage.title = title
        if (description) checkPackage.description = description
        if (price) checkPackage.price = price
        if (discount) checkPackage.discount = discount
        if (discountType) checkPackage.discountType = discountType
        // if (tests) checkPackage.tests = tests
        if (tests && Array.isArray(tests)) {
            // Filter only new test IDs that don't already exist in checkPackage.tests
            const newTests = tests.filter(
                testId => !checkPackage.tests.map(id => id.toString()).includes(testId.toString())
            );

            // Push only the new test IDs
            checkPackage.tests.push(...newTests);
        }

        if (image) {
            if (checkPackage.image) {
                await deleteFromCloudinary(checkPackage?.image)
            }
            let imageUrl = await uploadToCloudinary(image.tempFilePath)
            checkPackage.image = imageUrl
        }
        const result = await checkPackage.save()
        if (result) {
            return res.status(200).json({ success: true, msg: "Package updated successfully!", result })
        }
        return res.status(400).json({ msg: "Failed to update package!", success: false })
    } catch (error) {
        console.log("error on updatePackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}

exports.addOrRemoveTestIdToPackage = async (req, res) => {
    const id = req.params?.id; // Package ID
    const test = req.body?.test; // Single Test ID to add/remove

    try {
        const pkg = await Package.findById(id);
        if (!pkg) {
            return res.status(404).json({ success: false, msg: "Package not found!" });
        }

        if (!test) {
            return res.status(400).json({ success: false, msg: "Test ID is required!" });
        }

        const testIndex = pkg.tests.findIndex(t => t.toString() === test);

        if (testIndex > -1) {
            // ✅ Remove if exists
            pkg.tests.splice(testIndex, 1);
        } else {
            // ✅ Add if doesn't exist
            pkg.tests.push(test);
        }

        await pkg.save();
        return res.status(200).json({ success: true, result: pkg });

    } catch (error) {
        console.log("error on addOrRemoveTestIdToPackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


exports.deletePackage = async (req, res) => {
    const id = req.params?.id

    try {
        const checkPackage = await Package.findById(id);
        if (!checkPackage) {
            return res.status(404).json({ success: false, msg: "Package not found!" });
        }
        if (checkPackage.image) {
            await deleteFromCloudinary(checkPackage?.image)
        }
        const result = await Package.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, msg: "Package deleted successfully!", result })
        }
        return res.status(400).json({ msg: "Failed to delete package!", success: false })
    } catch (error) {
        console.log("error on deletePackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}


// ================================== book package =======================================

exports.bookPackage = async (req, res) => {
    const id = req.params?.id //package id
    // const testId = req.body?.testId
    const userId = req.payload?._id // it will be doctor id not user id

    // const amount = req.body?.amount
    const paidAmount = req.body?.paidAmount

    try {
        const checkPackage = await Package.findById(id).populate('tests');
        if (!checkPackage) {
            return res.status(404).json({ success: false, msg: "Package not found!" });
        }

        const checkUser = await User.findById(userId)

        // const checkPatient = await Patient.findOne({ userId: userId });
        const checkPatient = await Patient.findById(checkUser?.patientId[0])
        if (!checkPatient) {
            return res.status(404).json({ success: false, msg: "Patient not found!" });
        }

        let patientId = checkPatient?._id

        const result = new PackageBook({ userId: userId, patientId, packageId: id, amount: checkPackage?.price, paidAmount, title: checkPackage?.title });

        const tests = checkPackage.tests;

        if (!tests || tests.length === 0) {
            return res.status(400).json({ success: false, msg: "No tests found in the package" });
        }



        const labTestsData = tests.map(test => ({
            patientId,
            test: test._id,
            testName: test.name, // assuming `Test` model has `name`
            testDescription: test.description || '', // fallback to test's own desc
            price: test.price,
            due: 0,
            type: 'package',
            packageId: id,
            advance: 0,
            totalPaid: paidAmount,
            // paid: true,
        }));

        await LabTest.insertMany(labTestsData);

        await result.save();
        return res.status(200).json({ success: true, msg: "Package booked successfully!", result });
    } catch (error) {
        console.log("error on bookPackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}


exports.getBookPackage = async (req, res) => {
    const userId = req.params?.id || req.payload?._id
    try {
        // const result = await PackageBook.find({ userId }).sort({ createdAt: -1 }).populate('packageId', { populate: { path: 'tests' } })
        const result = await PackageBook.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'packageId',
                populate: {
                    path: 'tests',
                    model: 'Test'
                }
            });
        if (result) {
            return res.status(200).json({ success: true, result })
        }
        return res.status(404).json({ success: false, msg: "Package not found!" })
    } catch (error) {
        console.log("error on getBookPackage: ", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}


exports.getTop10PackagesInLastMonth = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const topPackages = await PackageBook.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneMonthAgo }
                }
            },
            {
                $group: {
                    _id: "$packageId",
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $sort: { totalBookings: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "packages", // matches the collection name in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "package"
                }
            },
            {
                $unwind: "$package"
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    package: 1 // return full package object
                }
            }
        ]);

        return res.status(200).json({ success: true, data: topPackages });

    } catch (error) {
        console.error("Error fetching top 10 packages:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};


/* exports.getTop10PackagesInLastMonth = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Go back 1 month

        const topPackages = await PackageBook.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneMonthAgo }
                }
            },
            {
                $group: {
                    _id: "$packageId",
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $sort: { totalBookings: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "packages",
                    localField: "_id",
                    foreignField: "_id",
                    as: "package"
                }
            },
            {
                $unwind: "$package"
            },
            {
                $project: {
                    _id: 0,
                    packageId: "$_id",
                    packageTitle: "$package.title",
                    totalBookings: 1
                }
            }
        ]);

        return res.status(200).json({ success: true, result: topPackages });

    } catch (error) {
        console.error("Error fetching top 10 packages:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
}; */
