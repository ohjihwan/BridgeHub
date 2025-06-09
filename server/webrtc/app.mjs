import express from 'express';
import corsMiddleware from './middlewares/cors.mjs';
import handlerMiddleware from './middlewares/handler.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import matchRoutes from './routes/match.mjs';
import rtcRoutes from './routes/rtc.mjs';

const app = express();

app.use(express.json());
app.use(corsMiddleware);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));


app.use('/api/match', matchRoutes);
app.use('/api/rtc', rtcRoutes);

app.use(handlerMiddleware);

export default app;