import express from 'express';
import rtcRoutes from './routes/rtcRoutes.mjs';

const router = express.Router();

router.use('/api/rtc', rtcRoutes);

export default router;
