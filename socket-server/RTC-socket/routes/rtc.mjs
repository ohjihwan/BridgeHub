import express from 'express';
import * as rtcController from '../controllers/rtc.mjs';

const router = express.Router();
router.get('/turn-credentials', rtcController.getTurnCredentialsAPI);
export default router;
