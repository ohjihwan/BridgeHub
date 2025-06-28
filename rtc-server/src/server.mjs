import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mediasoup from "mediasoup";

import router from "./router.mjs";
import socketAuth from "./util/authMiddleware.mjs";
import * as logger from "./util/logger.mjs";
import { getRoomManager } from "./service/rtcService.mjs";
import config, { RTC_PORT } from "./config/index.mjs";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  ...config.serverOptions,
  path: "/rtc",
});

app.use(express.json());
app.use(router);

io.use(socketAuth);

const roomMgr = getRoomManager();

let worker, routerMS;

async function initMediasoup() {
  worker = await mediasoup.createWorker();
  routerMS = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
    ],
  });
}

await initMediasoup();

io.on("connection", (socket) => {
  const { user } = socket;

  // TURN 기반 WebRTC 트랜스포트 생성
  socket.on("create-send-transport", async () => {
    const { iceServers } = socket.handshake.auth;
    const transport = await routerMS.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "3.107.24.214" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      iceServers,
    });

    socket.emit("send-transport-created", {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  socket.on("create-recv-transport", async () => {
    const { iceServers } = socket.handshake.auth;
    const transport = await routerMS.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "3.107.24.214" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      iceServers,
    });

    socket.emit("recv-transport-created", {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  // 룸 입장
  socket.on("join-room", ({ roomId, nickname }) => {
    if (!roomMgr.canJoin(roomId)) {
      return socket.emit("join-error", { code: "ROOM_FULL" });
    }
    roomMgr.join(roomId, socket);

    socket.to(roomId).emit("new-participant", {
      socketId: socket.id,
      nickname,
      user,
    });

    const peers = Array.from(roomMgr.rooms.get(roomId)).filter(
      (id) => id !== socket.id
    );
    socket.emit("joined-room", { roomId, peers });
  });

  // 시그널링
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
