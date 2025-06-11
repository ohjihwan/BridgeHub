import crypto from 'crypto';

const SECRET = 'bridgehub_secret_123';
const REALM  = 'bridgehub.example.com';

/**
 * @param {number} ttlSeconds   // 유효기간(초), 기본 24시간
 * @returns {{ username: string, password: string }}
 */
export function generateTurnCredentials(ttlSeconds = 86400) {
  const expiry   = Math.floor(Date.now()/1000) + ttlSeconds;
  const username = `${expiry}@${REALM}`;
  const password = crypto
    .createHmac('sha1', SECRET)
    .update(username)
    .digest('base64');

  return { username, password };
}
