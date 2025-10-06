// const RtcTokenBuilder2 = require("agora-token").RtcTokenBuilder;
// const RtcRole = require("agora-token").RtcRole;

// const generateAgoraToken = (channelName, uid) => {
//   try {
//     const appId = process.env.AGORAAPPID?.trim();
//     const appCertificate = process.env.AGORAAPPCERTIFICATE?.trim();
//     if (!appId || !appCertificate) {
//       throw new Error("Agora App ID or Certificate is missing");
//     }
//     const numericUid = typeof uid === "string" ? parseInt(uid) : uid;
//     const tokenExpirationInSeconds = 3600; // 1 hour
//     const joinChannelPrivilegeExpireInSeconds = 3600;
//     const pubAudioPrivilegeExpireInSeconds = 3600;
//     const pubVideoPrivilegeExpireInSeconds = 3600;
//     const pubDataStreamPrivilegeExpireInSeconds = 3600;
//     const token = RtcTokenBuilder2.buildTokenWithUidAndPrivilege(
//       appId,
//       appCertificate,
//       channelName,
//       numericUid,
//       tokenExpirationInSeconds,
//       joinChannelPrivilegeExpireInSeconds,
//       pubAudioPrivilegeExpireInSeconds,
//       pubVideoPrivilegeExpireInSeconds,
//       pubDataStreamPrivilegeExpireInSeconds
//     );
//     console.log("Token Generation Debug:", {
//       channelName,
//       uid: numericUid,
//       tokenLength: token.length,
//     });
//     return token;
//   } catch (error) {
//     console.error("Token Generation Error:", error);
//     throw error;
//   }
// };

// module.exports = generateAgoraToken;

// const RtcTokenBuilder = require("../src/RtcTokenBuilder2").RtcTokenBuilder;
// const RtcRole = require("../src/RtcTokenBuilder2").Role;

// // Get the value of the environment variable AGORA_APP_ID. Make sure you set this variable to the App ID you obtained from Agora console.
// const appId = process.env.AGORA_APP_ID;
// // Get the value of the environment variable AGORA_APP_CERTIFICATE. Make sure you set this variable to the App certificate you obtained from Agora console
// const appCertificate = process.env.AGORA_APP_CERTIFICATE;
// // Replace channelName with the name of the channel you want to join
// const channelName = "channelName";
// // Fill in your actual user ID
// const uid = 2882341273;
// // Set streaming permissions
// const role = RtcRole.PUBLISHER;
// // Token validity time in seconds
// const tokenExpirationInSecond = 3600;
// // The validity time of all permissions in seconds
// const privilegeExpirationInSecond = 3600;

// console.log("App Id:", appId);
// console.log("App Certificate:", appCertificate);
// if (appId == undefined || appId == "" || appCertificate == undefined || appCertificate == "") {
//   console.log("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE");
//   process.exit(1);
// }

// // Generate Token
// const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, tokenExpirationInSecond, privilegeExpirationInSecond);
// console.log("Token with int uid:", tokenWithUid);

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const APP_ID = process.env.AGORA_APPID;
const APP_CERT = process.env.AGORA_CERTIFICATE;
/**
 * Generate an Agora RTC Token
 * @param {string} channelName - The unique channel name
 * @param {string|number} uid - Unique user ID
 * @param {number} expireTime - Expiry in seconds (default 3600 = 1h)
 */
function generateAgoraToken(channelName, uid, expireTime = 3600) {
  if (!APP_ID || !APP_CERT) {
    throw new Error("Agora APP_ID or APP_CERT not set in environment");
  }
  const role = RtcRole.PUBLISHER;
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channelName,
    uid,
    role,
    expireTime
  );
  return token;
}

module.exports = { generateAgoraToken };
