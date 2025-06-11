import { getTurnCredentials } from '../utils/ice.mjs';

export function generateTurnCredentials(req, res) {
  try {
    const creds = getTurnCredentials();
    res.json({
      urls: creds.urls,
      username: creds.username,
      credential: creds.credential,
      ttl: creds.ttl,
    });
  } catch (err) {
    res.status(500).json({ error: 'TURN credentials 생성 실패', details: err.message });
  }
}