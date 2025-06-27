import express from 'express';
import rtcRoutes from './routes/rtcRoutes.mjs';

const router = express.Router();

// API 명세 기반: front-server 의 /api/rtc/* 로 들어오면 여기로
router.use('/api/rtc', rtcRoutes);

export default router;
