const axios = require("axios");
const base64 = require("base-64");

const APP_ID = process.env.AGORA_APPID;
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
const CUSTOMER_CERT = process.env.AGORA_CUSTOMER_CERTIFICATE;

async function sendRtmMessage(senderId, receiverId, message) {
  const credentials = base64.encode(`${CUSTOMER_ID}:${CUSTOMER_CERT}`);

  const url = `https://api.agora.io/dev/v2/project/${APP_ID}/rtm/message/peer/${receiverId}`;

  const body = {
    message_type: "TEXT",
    message: message,
    from_user_id: senderId,
  };

  const headers = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("✅ RTM message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending RTM message:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send RTM message");
  }
}

module.exports = { sendRtmMessage };
