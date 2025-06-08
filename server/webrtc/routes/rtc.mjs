import express from 'express';
import * as rtcController from '../controllers/rtc.mjs';

const router = express.Router();

router.get('/ping', rtcController.ping);

export default router;
