import { Router } from 'express';
import { jwtAuth } from '../util/authMiddleware.mjs';
import * as rtcController from '../controller/rtcController.mjs';

const router = Router();

// REST API 접두사는 /rtc-api 이지만 실제 호출은 /api/rtc/... 으로 프록시 설정 예정
router.use(jwtAuth);

// GET  /api/rtc/status
router.get('/status', rtcController.status);      
// POST /api/rtc/start
router.post('/start',  rtcController.startSession); 
// POST /api/rtc/stop
router.post('/stop',   rtcController.stopSession);  

export default router;
