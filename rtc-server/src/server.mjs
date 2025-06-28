import "dotenv/config"; // 환경변수 로드
import express from "express";
import http from "http";
import { Server } from "socket.io";

import router from "./router.mjs"; 
import socketAuth from "./util/authMiddleware.mjs"; 
import * as logger from "./util/logger.mjs"; 
import { getRoomManager } from "./service/rtcService.mjs"; 
import config, { RTC_PORT } from "./config/index.mjs";

const app = express();
const server = http.createServer(app);

// Socket.IO 에서 path '/rtc' 를 설정하여 클라이언트와 매칭
const io = new Server(server, {
  ...config.serverOptions,
  path: "/rtc",
});

app.use(express.json());
app.use(router); // /api/rtc/* REST API 라우팅

io.use(socketAuth); // JWT 인증 미들웨어

const roomMgr = getRoomManager();

io.on("connection", (socket) => {
  const { user } = socket;

  // 룸 입장
  socket.on("join-room", ({ roomId, nickname }) => {
    if (!roomMgr.canJoin(roomId)) {
      return socket.emit("join-error", { code: "ROOM_FULL" });
    }
    roomMgr.join(roomId, socket);

    // (1) 기존 참가자에게 새 참가자 알림
    socket.to(roomId).emit("new-participant", {
      socketId: socket.id,
      nickname,
      user,
    });

    // (2) 입장자에게 기존 피어 목록 전달
    const peers = Array.from(roomMgr.rooms.get(roomId)).filter(
      (id) => id !== socket.id
    );
    socket.emit("joined-room", { roomId, peers });
  });

  // 시그널링 메시지 포워딩
  ["offer", "answer", "ice-candidate"].forEach((evt) => {
    socket.on(evt, (data) => {
      io.to(data.to).emit(evt, {
        from: socket.id,
        payload: data.payload,
      });
    });
  });

  // 룸 퇴장
  socket.on("leave-room", ({ roomId }) => {
    roomMgr.leave(roomId, socket);
    socket.to(roomId).emit("participant-left", { socketId: socket.id });
  });

  // 연결 종료 시 모든 룸에서 제거
  socket.on("disconnect", () => {
    for (const [roomId, sockets] of roomMgr.rooms.entries()) {
      if (sockets.has(socket.id)) {
        roomMgr.leave(roomId, socket);
        socket.to(roomId).emit("participant-left", { socketId: socket.id });
      }
    }
  });
});

// 서버 시작
server.listen(RTC_PORT, "0.0.0.0", () => {
  logger.log(`RTC server listening on port ${RTC_PORT}`);
});
