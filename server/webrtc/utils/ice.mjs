import crypto from 'crypto';

export function generateTurnCredentials() {
  const username = String(Math.floor(Date.now() / 1000) + 3600); // TTL 1시간
  const credential = crypto
    .createHmac('sha1', process.env.TURN_SECRET)
    .update(username)
    .digest('base64');

  return {
    username,
    credential,
    urls: [`turn:${process.env.TURN_HOST}:3478`]
  };
}
