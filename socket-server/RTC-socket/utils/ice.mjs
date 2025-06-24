import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export function getTurnCredentials() {
  const secret = process.env.TURN_SECRET;
  const ttl = Number(process.env.TURN_TTL) || 3600;
  const usernamePrefix = process.env.TURN_USERNAME_PREFIX || "bridgehub";
  const realm = process.env.TURN_REALM;
  const now = Math.floor(Date.now() / 1000);
  const expires = now + ttl;
  const username = `${usernamePrefix}:${expires}`;
  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(username);
  const credential = hmac.digest("base64");

  const stunUrl = process.env.TURN_URL.replace(/^turn:/, "stun:");
  const urls = [
    stunUrl,
    `${process.env.TURN_URL}?transport=udp`,
    `${process.env.TURN_URL}?transport=tcp`
  ];

  return {
    urls,
    username,
    credential,
    ttl,
    realm,
  };
}
