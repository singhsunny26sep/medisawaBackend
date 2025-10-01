require("dotenv").config();
const APIKEY = process.env.api_key_2Factor;
// const TwoFactor = new (require('2factor'))(process.env.api_key_2Factor)
const TwoFactor = new (require("2factor"))(APIKEY);
var axios = require("axios");

exports.sendOTP = async (mobile) => {
  // TwoFactor.sendOTP(`+91${mobile}`, { otp: "1234", template: "riceDealOTP" }).then((sessionId) => {
  TwoFactor.sendOTP(mobile, { template: "riceDealOTP" }).then(
    (sessionId) => {
      console.log("sessionId: ", sessionId);
      return sessionId;
    },
    (error) => {
      console.log("error: ", error);
      return error;
    }
  );
};

exports.verifyOTPFactor = async (sessionId, otp) => {
  TwoFactor.verifyOTP(sessionId, otp).then(
    (response) => {
      console.log("response: ", response);
      return response;
    },
    (error) => {
      console.log("error: ", error);
    }
  );
};

exports.urlSendTestOtp = async (mobile) => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://2factor.in/API/V1/${APIKEY}/SMS/${mobile}/AUTOGEN`, // ✅ +91 hata diya, OTP1 bhi hata diya
      headers: {},
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("error: ", error.response?.data || error.message);
    throw error;
  }
};

exports.urlVerifyOtp = async (sessionId, otp) => {
  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://2factor.in/API/V1/${APIKEY}/SMS/VERIFY/${sessionId}/${otp}`,
      headers: {},
    };
    const response = await axios(config);
    // console.log("Response: ", response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.log("Error: ", error.message);
    throw error; // Ensure the error is propagated
  }
};
