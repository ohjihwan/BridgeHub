import express from 'express';
import { generateTurnCredentials } from '../utils/ice.mjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/turn-credentials', (req, res) => {
  const {
    TURN_SECRET,
    TURN_TTL = 3600,
    TURN_USERNAME_PREFIX = 'bridgehub',
    TURN_URL
  } = process.env;

  const creds = generateTurnCredentials(TURN_SECRET, TURN_TTL, TURN_USERNAME_PREFIX);

  res.json({
    urls: [TURN_URL],
    username: creds.username,
    credential: creds.credential,
  });
});

export default router;
