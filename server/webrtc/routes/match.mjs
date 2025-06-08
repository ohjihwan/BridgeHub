import express from 'express';
import * as matchController from '../controllers/match.mjs';

const router = express.Router();

router.get('/ping', matchController.ping);

export default router;