import dotenv from "dotenv";
dotenv.config();
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.mjs";
import { Server } from "socket.io";
import handleSfuSocket from './controllers/sfuSocketController.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

const PORT = process.env.RTC_PORT;
const server = https.createServer(sslOptions, app);

const io = new Server(server, { cors: { origin: '*' } });

// SFU 시그널링 핸들러 등록
handleSfuSocket(io);

server.listen(PORT, () => {
  console.log(`[RTC] HTTPS 서버가 https://thebridgehub.org:${PORT} 에서 실행 중!`);
});
