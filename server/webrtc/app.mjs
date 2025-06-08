import express from 'express';
import corsMiddleware from './middlewares/cors.mjs';
import handlerMiddleware from './middlewares/handler.mjs';

import matchRoutes from './routes/match.mjs';
import rtcRoutes from './routes/rtc.mjs';

const app = express();

app.use(express.json());
app.use(corsMiddleware);


app.use('/api/match', matchRoutes);
app.use('/api/rtc', rtcRoutes);

app.use(handlerMiddleware);

export default app;