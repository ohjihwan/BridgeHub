import { Router } from 'express';
import { jwtAuth } from '../util/authMiddleware.mjs';
import * as rtcController from '../controller/rtcController.mjs';

const router = Router();
router.use(jwtAuth);

// GET  /api/rtc/status
router.get('/status', rtcController.status);
// POST /api/rtc/start
router.post('/start',  rtcController.startSession);
// POST /api/rtc/stop
router.post('/stop',   rtcController.stopSession);

export default router;