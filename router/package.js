const express = require("express");
const packageRouter = express.Router();

const {
  getAllPackages,
  paginationPackage,
  createPackage,
  updatePackage,
  addOrRemoveTestIdToPackage,
  deletePackage,
  bookPackage,
  getTop10PackagesInLastMonth,
  getBookPackage,
} = require("../controller/package");
const { verifyToken } = require("../middleware/authValidation");

packageRouter.get("/getOne/:id", getAllPackages);
packageRouter.get("/getAll", getAllPackages);
packageRouter.get("/pagination", paginationPackage);
packageRouter.post("/add", verifyToken, createPackage);
packageRouter.put("/update/:id", verifyToken, updatePackage);
packageRouter.put(
  "/addOrRemoveTest/:id",
  verifyToken,
  addOrRemoveTestIdToPackage
);
packageRouter.delete("/delete/:id", verifyToken, deletePackage);
packageRouter.post("/bookPackage/:id", verifyToken, bookPackage); //id will of pacakge
packageRouter.get("/getHistory", verifyToken, getBookPackage);
packageRouter.get("/getHistoryById/:id", getBookPackage);
packageRouter.get("/topMustPackage", getTop10PackagesInLastMonth);

module.exports = packageRouter;
