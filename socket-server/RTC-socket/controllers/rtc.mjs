import { generateTurnCredentials } from '../utils/ice.mjs';

export function getTurnCredentials(req, res) {
  try {
    const creds = generateTurnCredentials();

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
