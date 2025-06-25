import dotenv from "dotenv";
dotenv.config();

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.mjs";
import { Server } from "socket.io";
import handleSfuSocket from './controllers/sfuSocket.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, process.env.SSL_KEY_PATH)),
    cert: fs.readFileSync(path.resolve(__dirname, process.env.SSL_CERT_PATH)),
  };
} catch (err) {
  console.error("[인증서 읽기 실패] SSL 경로 또는 파일 확인:", err.message);
  process.exit(1);
}

const PORT = process.env.RTC_PORT || 7600;
const HOST = "0.0.0.0";

const server = https.createServer(sslOptions, app);

const io = new Server(server, {
  cors: { origin: "*" }
});
handleSfuSocket(io);

try {
  const server = https.createServer(sslOptions, app);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[RTC] HTTPS 서버가 https://${HOST}:${PORT} 에서 실행중`);
  });
} catch (error) {
  console.error("HTTPS 서버 실행 실패:", error);
}