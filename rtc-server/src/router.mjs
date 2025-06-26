import express from 'express';
import rtcRoutes from './routes/rtcRoutes.mjs';

const router = express.Router();

router.use('/', rtcRoutes);

export default router;