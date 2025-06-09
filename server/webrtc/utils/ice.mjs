import crypto from 'crypto';

export function generateTurnCredentials(secret, ttl = 3600, usernamePrefix = 'bridgehub') {
  const unixTime = Math.floor(Date.now() / 1000) + ttl;
  const username = `${unixTime}:${usernamePrefix}`;

  const credential = crypto
    .createHmac('sha1', secret)
    .update(username)
    .digest('base64');

  return { username, credential };
}
