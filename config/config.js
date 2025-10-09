require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5600,
  MONGO_URI: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  RESET_SECRET: process.env.RESET_SECRET,
};
