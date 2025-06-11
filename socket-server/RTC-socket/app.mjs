import express from "express";
import rtcRouter from "./routes/rtc.mjs";
import handlerMiddleware from "./middlewares/handler.mjs";
import corsMiddleware from "./middlewares/cors.mjs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(corsMiddleware);
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/rtc", rtcRouter);
app.use(handlerMiddleware);

export default app;
