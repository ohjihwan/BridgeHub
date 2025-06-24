// rtc-socket/server.mjs

import fs from "fs";
import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server as IOServer } from "socket.io";
import "dotenv/config";
import { handleSocketConnection } from "./controllers/rtcSocket.mjs";

// 1. __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 2. Express 앱 생성
const app = express();

// 3. public 폴더(한 단계 상위)에 있는 정적 파일 서빙
app.use(express.static(path.join(__dirname, "..", "public")));

// 4. 루트 요청에 index.html 내보내기 (생략해도 express.static이 index.html을 인식하지만, 확실하게!)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// 5. 포트 설정
const port = process.env.RTC_PORT || 7900;

// 6. HTTP 서버 생성
const server = http.createServer(app);
console.log("[RTC] Running in development mode with HTTP");

// 7. Socket.IO 생성 및 핸들러 등록
const io = new IOServer(server, {
  cors: { origin: "*" },
});
handleSocketConnection(io);

// 8. 모든 인터페이스(0.0.0.0)에 바인딩
server.listen(port, "0.0.0.0", () => {
  console.log(`RTC server listening on 0.0.0.0:${port}`);
});
