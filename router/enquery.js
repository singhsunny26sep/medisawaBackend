const express = require("express");
const enqueryRouter = express.Router();

const {
  getEnquery,
  addEnquery,
  updateEnquery,
  deleteEnquery,
  getAllByPagination,
} = require("../controller/enquery");
const { verifyToken } = require("../middleware/authValidation");

enqueryRouter.get("/getOne/:id", getEnquery);
enqueryRouter.get("/getAll", getEnquery);
enqueryRouter.get("/pagination", getAllByPagination);
enqueryRouter.post("/add", addEnquery);
enqueryRouter.put("/update/:id", verifyToken, updateEnquery);
enqueryRouter.delete("/delete/:id", verifyToken, deleteEnquery);

module.exports = enqueryRouter;
