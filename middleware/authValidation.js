const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

exports.generateToken = async (checkUser) => {
  const token = jwt.sign(
    {
      _id: checkUser?._id,
      name: checkUser?.name,
      email: checkUser?.email,
      mobile: checkUser?.mobile,
      address: checkUser?.address,
      role: checkUser?.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  return token;
};

exports.verifyToken = async (req, res, next) => {
  let token = req.headers["authorization"];
  try {
    if (!token) {
      return res
        .status(401)
        .json({ msg: "Access Denied! Missing Token", success: false });
    }
    let splitToken = token.split(" ")[1];
    if (!splitToken) {
      return res
        .status(401)
        .json({ msg: "Access Denied! Unexpected Token", success: false });
    }
    const decodedToken = jwt.verify(splitToken, secret);
    if (!decodedToken) {
      return res
        .status(401)
        .json({ msg: "Access Denied! Invalid Token", success: false });
    }
    const checkUser = await User.findById(decodedToken?._id);
    if (checkUser) {
      req.payload = checkUser;
      next();
    } else {
      return res
        .status(401)
        .json({ msg: "Access Denied! User not found", success: false });
    }
  } catch (error) {
    console.log("error on auth: ", error);
    return res.status(500).json({ err: error.message, error, success: false });
  }
};
