import { Router } from 'express';
import { jwtAuth } from '../utils/authMiddleware.mjs';
import * as rtcCtrl from '../controllers/rtcController.mjs';

const router = Router();

// 방 생성: POST /api/rtc/rooms
router.post('/rooms', jwtAuth, rtcCtrl.createRoom);

// 토큰 검증: GET /api/rtc/auth
router.get('/auth', jwtAuth, rtcCtrl.validateToken);

export default router;
