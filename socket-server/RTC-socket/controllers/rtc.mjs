import { getTurnCredentials } from '../utils/ice.mjs';

export function getTurnCredentialsAPI(req, res) {
  try {
    const creds = getTurnCredentials();
    res.json({
      urls: creds.urls,
      username: creds.username,
      credential: creds.credential,
      ttl: creds.ttl,
      realm: creds.realm,
    });
  } catch (err) {
    res.status(500).json({ error: 'TURN credentials 생성 실패', details: err.message });
  }
}
