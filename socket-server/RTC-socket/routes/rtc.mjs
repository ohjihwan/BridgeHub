import express from 'express';
import * as rtcController from '../controllers/rtcController.mjs';

const router = express.Router();
router.get('/turn-credentials', rtcController.getTurnCredentialsAPI);
export default router;
