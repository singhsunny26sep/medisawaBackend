const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require("agora-access-token");

const APP_ID = process.env.AGORA_APPID;
const APP_CERT = process.env.AGORA_CERTIFICATE;

/**
 * Generate an Agora RTC Token
 * @param {string} channelName - The unique channel name
 * @param {string|number} uid - Unique user ID (use 0 to let Agora assign)
 * @param {number} expireTimeInSeconds - Token validity duration in seconds (default 3600 = 1h)
 */
function generateAgoraToken(channelName, uid, expireTimeInSeconds = 3600) {
  if (!APP_ID || !APP_CERT) {
    throw new Error("Agora APP_ID or APP_CERT not set in environment");
  }
  const role = RtcRole.PUBLISHER;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;
  console.log("🔑 Token Generation:", {
    currentTime: new Date(currentTimestamp * 1000).toISOString(),
    expiryTime: new Date(privilegeExpiredTs * 1000).toISOString(),
    validForSeconds: expireTimeInSeconds,
    channelName,
    uid,
  });
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  return token;
}

function generateRtmToken(accountName, expireTimeInSeconds = 3600) {
  if (!APP_ID || !APP_CERT) {
    throw new Error("Agora APP_ID or APP_CERT not set in environment");
  }
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERT,
    accountName,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  );
  return token;
}

module.exports = { generateAgoraToken, generateRtmToken };
