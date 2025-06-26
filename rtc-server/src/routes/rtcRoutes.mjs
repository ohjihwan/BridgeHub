// src/routes/rtcRoutes.mjs
import { Router } from 'express';
import { createRoom, validateToken } from '../controller/rtcController.mjs';
import { jwtAuth } from '../util/authMiddleware.mjs';

// 테스트 토큰
import { issueTestToken } from '../controller/rtcController.mjs';

const router = Router();

// POST /api/rtc/rooms
router.post('/rooms', jwtAuth, createRoom);    
// GET  /api/rtc/auth
router.get('/auth', jwtAuth, validateToken); 

// POST /api/rtc/test/token -> 나중에 삭제하기
router.post('/test/token', issueTestToken);

export default router;
