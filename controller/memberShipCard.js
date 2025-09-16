const {
  createMembershipCard,
  getAllMembershipCards,
  updateMembershipCard,
  deleteMembershipCard,
} = require("../service/memberShipCard");
const { sendSuccess, sendError } = require("../utils/response");

exports.addMembershipCard = async (req, res) => {
  try {
    const card = await createMembershipCard(req.body);
    return sendSuccess(res, 201, "Membership Card created successfully", card);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

exports.getMembershipCards = async (req, res) => {
  try {
    const cards = await getAllMembershipCards();
    return sendSuccess(
      res,
      200,
      "Membership Cards fetched successfully",
      cards
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

exports.updateMembershipCard = async (req, res) => {
  try {
    const card = await updateMembershipCard(req.params.id, req.body);
    return sendSuccess(res, 200, "Membership Card updated successfully", card);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.deleteMembershipCard = async (req, res) => {
  try {
    await deleteMembershipCard(req.params.id);
    return sendSuccess(res, 200, "Membership Card deleted successfully");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
