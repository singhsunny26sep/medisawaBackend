const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authValidation");
const {
  addMembershipCard,
  getMembershipCards,
  updateMembershipCard,
  deleteMembershipCard,
} = require("../controller/memberShipCard");

router.post("/add", verifyToken, addMembershipCard);
router.get("/getAll", getMembershipCards);
router.get("/getOne/:id", getMembershipCards);
router.put("/update/:id", verifyToken, updateMembershipCard);
router.delete("/delete/:id", verifyToken, deleteMembershipCard);

module.exports = router;
