const MembershipCard = require("../model/MemberShipCard");

exports.createMembershipCard = async (data) => {
  return await MembershipCard.create(data);
};

exports.getAllMembershipCards = async () => {
  return await MembershipCard.find({ isActive: true, isDeleted: false });
};

exports.getSingleMembershipCard = async (id) => {
  return await MembershipCard.findOne({
    isActive: true,
    isDeleted: false,
    _id: id,
  });
};

exports.updateMembershipCard = async (id, updateData) => {
  return await MembershipCard.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deleteMembershipCard = async (id) => {
  return await MembershipCard.findByIdAndUpdate(
    id,
    { isActive: false, isDeleted: true },
    { new: true },
  );
};
