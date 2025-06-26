import express from 'express';
import rtcRoutes from './routes/rtcRoutes.mjs';

const app = express();
app.use(express.json());
app.use('/api/rtc', rtcRoutes);

export default app;
