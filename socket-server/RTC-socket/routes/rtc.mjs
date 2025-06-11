import express from 'express';
import * as rtcController from '../controllers/rtc.mjs';

const router = express.Router();

/**
 * [GET] /api/rtc/turn-credentials
 * - 클라이언트(WebRTC Peer)에서 TURN/STUN credentials 발급
 */
router.get('/turn-credentials', rtcController.generateTurnCredentials);

export default router;