// socket-server/rtc-socket/server.mjs

import express from "express";
import http from "http";            // ← https 대신 http
import path from "path";
import { fileURLToPath } from "url";
import { Server as IOServer } from "socket.io";
import "dotenv/config";
import { handleSocketConnection } from "./controllers/rtcSocket.mjs";
import { getTurnCredentials } from "./utils/ice.mjs";

// __dirname 정의 (ESM 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// 1) 정적 파일 서빙 (한 단계 위의 public 폴더)
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// 2) TURN 자격증명 API
app.get("/api/rtc/turn-credentials", async (req, res) => {
  try {
    const creds = getTurnCredentials();
    res.json(creds);
  } catch (err) {
    console.error("turn-credentials error:", err);
    res.status(500).json({ error: "Failed to get TURN credentials" });
  }
});

// 3) 포트 설정
const port = process.env.RTC_PORT || 7900;

// → HTTPS 인증서 관련 코드는 모두 제거하고 HTTP 서버 생성
const server = http.createServer(app);
console.log("[RTC] Running with HTTP");

// 4) Socket.IO 생성 및 핸들러 등록
const io = new IOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  },
});
handleSocketConnection(io);

// 5) 서버 시작 (0.0.0.0 바인딩)
server.listen(port, "0.0.0.0", () => {
  console.log(`RTC server listening on http://0.0.0.0:${port}`);
});
