import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mediasoup from "mediasoup";

import router from "./router.mjs";
import socketAuth from "./src/util/authMiddleware.mjs";
import * as logger from "./src/util/logger.mjs";
import { getRoomManager } from "./src/service/rtcService.mjs";
import RoomManager from "./src/sfu/roomManager.mjs";
import Peer from "./src/sfu/peer.mjs";
import config, { RTC_PORT, MAX_PEERS_PER_ROOM } from "./src/config/index.mjs";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  ...config.serverOptions,
  path: "/rtc",
});

app.use(express.json());
app.use(router);

io.use(socketAuth);

// RTC 관련 매니저들
const roomMgr = getRoomManager(); // Spring API 연동용
const sfuRoomMgr = new RoomManager(MAX_PEERS_PER_ROOM); // SFU 전용

let worker, routerMS;

async function initMediasoup() {
  try {
    logger.log("Initializing mediasoup worker...");
    worker = await mediasoup.createWorker(config.mediasoup.worker);
    
    worker.on('died', () => {
      logger.error('mediasoup worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    logger.log("Creating mediasoup router...");
    routerMS = await worker.createRouter({
      mediaCodecs: config.mediasoup.router.mediaCodecs,
    });
    
    logger.log("Mediasoup initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize mediasoup:", error);
    process.exit(1);
  }
}

await initMediasoup();

io.on("connection", (socket) => {
  const { user } = socket;
  logger.log(`User connected: ${user?.username || socket.id} (authenticated: ${user?.authenticated || false})`);

  // WebRTC Transport 생성
  socket.on("create-send-transport", async (callback) => {
    try {
      const transport = await routerMS.createWebRtcTransport({
        ...config.mediasoup.webRtcTransport,
        iceServers: config.turn.iceServers,
      });

      const params = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      };

      // Transport 이벤트 핸들링
      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          transport.close();
        }
      });

      transport.on('close', () => {
        logger.debug(`Send transport closed for ${socket.id}`);
      });

      // Peer에 transport 저장
      let peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        peer = new Peer(transport, null);
        sfuRoomMgr.setPeer(socket.id, peer);
      } else {
        peer.sendTransport = transport;
      }

      if (callback) callback(params);
      else socket.emit("send-transport-created", params);
      
      logger.debug(`Send transport created for ${socket.id}`);
    } catch (error) {
      logger.error(`Error creating send transport for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
      else socket.emit("transport-error", { error: error.message });
    }
  });

  socket.on("create-recv-transport", async (callback) => {
    try {
      const transport = await routerMS.createWebRtcTransport({
        ...config.mediasoup.webRtcTransport,
        iceServers: config.turn.iceServers,
      });

      const params = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      };

      // Transport 이벤트 핸들링
      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          transport.close();
        }
      });

      transport.on('close', () => {
        logger.debug(`Recv transport closed for ${socket.id}`);
      });

      // Peer에 transport 저장
      let peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        peer = new Peer(null, transport);
        sfuRoomMgr.setPeer(socket.id, peer);
      } else {
        peer.recvTransport = transport;
      }

      if (callback) callback(params);
      else socket.emit("recv-transport-created", params);
      
      logger.debug(`Recv transport created for ${socket.id}`);
    } catch (error) {
      logger.error(`Error creating recv transport for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
      else socket.emit("transport-error", { error: error.message });
    }
  });

  // Transport 연결
  socket.on("connect-transport", async ({ transportId, dtlsParameters }, callback) => {
    try {
      const peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        throw new Error('Peer not found');
      }

      let transport;
      if (peer.sendTransport && peer.sendTransport.id === transportId) {
        transport = peer.sendTransport;
      } else if (peer.recvTransport && peer.recvTransport.id === transportId) {
        transport = peer.recvTransport;
      }

      if (!transport) {
        throw new Error('Transport not found');
      }

      await transport.connect({ dtlsParameters });
      
      if (callback) callback({ success: true });
      logger.debug(`Transport ${transportId} connected for ${socket.id}`);
    } catch (error) {
      logger.error(`Error connecting transport for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
    }
  });

  // Producer 생성
  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    try {
      const peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        throw new Error('Peer not found');
      }

      const producer = await peer.produce({ kind, rtpParameters });
      
      // 같은 룸의 다른 참가자들에게 새 producer 알림
      const roomId = sfuRoomMgr.getUserRoom(socket.id);
      if (roomId) {
        socket.to(roomId).emit("new-producer", {
          producerId: producer.id,
          kind: producer.kind,
          socketId: socket.id
        });
      }

      if (callback) callback({ id: producer.id });
      logger.debug(`Producer created: ${producer.id} (${kind}) for ${socket.id}`);
    } catch (error) {
      logger.error(`Error creating producer for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
    }
  });

  // Consumer 생성
  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    try {
      const peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        throw new Error('Peer not found');
      }

      const consumer = await peer.consume({ producerId, rtpCapabilities });
      
      if (callback) callback({
        id: consumer.id,
        producerId: producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters
      });
      
      logger.debug(`Consumer created: ${consumer.id} for producer ${producerId}`);
    } catch (error) {
      logger.error(`Error creating consumer for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
    }
  });

  // Consumer resume
  socket.on("resume-consumer", async ({ consumerId }, callback) => {
    try {
      const peer = sfuRoomMgr.getPeer(socket.id);
      if (!peer) {
        throw new Error('Peer not found');
      }

      const consumer = peer.getConsumer(consumerId);
      if (consumer) {
        await consumer.resume();
      }
      
      if (callback) callback({ success: true });
      logger.debug(`Consumer resumed: ${consumerId}`);
    } catch (error) {
      logger.error(`Error resuming consumer for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
    }
  });

  // 룸 입장
  socket.on("join-room", async ({ roomId, nickname }, callback) => {
    try {
      const { user } = socket;
      
      // Spring API를 통한 룸 입장 가능 여부 확인
      const joinCheck = await roomMgr.canJoin(roomId, user);
      
      if (!joinCheck.canJoin) {
        const errorMessages = {
          'ROOM_FULL': 'Room is full',
          'NOT_MEMBER': 'You are not a member of this study room',
          'ROOM_INACTIVE': 'This room is not active',
          'VERIFICATION_FAILED': 'Could not verify room access'
        };
        
        const error = { 
          code: joinCheck.reason, 
          message: errorMessages[joinCheck.reason] || 'Cannot join room'
        };
        
        if (callback) callback({ error });
        else socket.emit("join-error", error);
        return;
      }

      // SFU 룸 매니저에도 입장
      if (!sfuRoomMgr.canJoin(roomId)) {
        const error = { code: "ROOM_FULL", message: "Room is full" };
        if (callback) callback({ error });
        else socket.emit("join-error", error);
        return;
      }

      // 두 매니저 모두에 입장 처리
      await roomMgr.join(roomId, socket);
      sfuRoomMgr.join(roomId, socket);

      // 기존 참가자들의 producer 정보 전송
      const participants = sfuRoomMgr.getRoomParticipants(roomId).filter(id => id !== socket.id);
      const producers = [];
      
      for (const participantId of participants) {
        const peer = sfuRoomMgr.getPeer(participantId);
        if (peer) {
          for (const producer of peer.getAllProducers()) {
            producers.push({
              producerId: producer.id,
              kind: producer.kind,
              socketId: participantId
            });
          }
        }
      }

      socket.to(roomId).emit("new-participant", {
        socketId: socket.id,
        nickname: nickname || user?.nickname || user?.username || 'Anonymous',
        user: {
          id: user?.id,
          username: user?.username,
          nickname: user?.nickname,
          authenticated: user?.authenticated || false
        },
      });

      const response = { 
        success: true,
        roomId, 
        participants: participants,
        producers: producers,
        participantCount: sfuRoomMgr.rooms.get(roomId)?.size || 0,
        user: {
          authenticated: user?.authenticated || false,
          username: user?.username || 'Anonymous',
          nickname: user?.nickname || 'Anonymous'
        }
      };

      if (callback) callback(response);
      else socket.emit("joined-room", response);
      
      logger.log(`${user?.username || socket.id} joined room ${roomId} (authenticated: ${user?.authenticated || false})`);
    } catch (error) {
      logger.error(`Error joining room for ${socket.id}:`, error);
      const errorResponse = { error: error.message };
      if (callback) callback(errorResponse);
      else socket.emit("join-error", errorResponse);
    }
  });

  // 채팅 메시지 처리
  socket.on("chat-message", async (data) => {
    const { user } = socket;
    const roomId = sfuRoomMgr.getUserRoom(socket.id);
    
    if (!roomId) {
      socket.emit("chat-error", { message: "You are not in a room" });
      return;
    }

    const messageData = {
      userId: user?.id,
      username: user?.username || 'Anonymous',
      nickname: user?.nickname || 'Anonymous',
      message: data.message,
      timestamp: new Date().toISOString(),
      authenticated: user?.authenticated || false
    };

    // 룸의 모든 사용자에게 메시지 전송
    io.to(roomId).emit("chat-message", messageData);

    // 인증된 사용자의 메시지는 데이터베이스에 저장
    if (user?.authenticated && user?.id) {
      try {
        await roomMgr.saveChatMessage(roomId, user.id, data.message, 'TEXT');
      } catch (error) {
        logger.error(`Failed to save chat message: ${error.message}`);
      }
    }

    logger.debug(`Chat message from ${user?.username || socket.id} in room ${roomId}`);
  });

  // 룸 퇴장
  socket.on("leave-room", async ({ roomId }, callback) => {
    try {
      // 두 매니저 모두에서 퇴장 처리
      await roomMgr.leave(roomId, socket);
      sfuRoomMgr.leave(roomId, socket);
      
      socket.to(roomId).emit("participant-left", { socketId: socket.id });
      
      if (callback) callback({ success: true });
      logger.log(`${user?.username || socket.id} left room ${roomId}`);
    } catch (error) {
      logger.error(`Error leaving room for ${socket.id}:`, error);
      if (callback) callback({ error: error.message });
    }
  });

  // 연결 해제 처리
  socket.on("disconnect", (reason) => {
    logger.log(`User disconnected: ${user?.username || socket.id} (${reason})`);
    
    // 모든 룸에서 제거
    for (const [roomId, sockets] of sfuRoomMgr.rooms.entries()) {
      if (sockets.has(socket.id)) {
        roomMgr.leave(roomId, socket);
        sfuRoomMgr.leave(roomId, socket);
        socket.to(roomId).emit("participant-left", { socketId: socket.id });
      }
    }
  });
});

// 서버 시작
server.listen(RTC_PORT, "0.0.0.0", () => {
  logger.log(`🎥 RTC server listening on port ${RTC_PORT}`);
  logger.log(`📊 Health check: http://localhost:${RTC_PORT}/health`);
  logger.log(`🏠 Rooms API: http://localhost:${RTC_PORT}/api/rooms`);
  logger.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.log(`🔗 API Server: ${process.env.API_URL || "http://localhost:7100"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.log("🔄 RTC Server shutting down gracefully...");
  server.close(() => {
    if (worker) {
      worker.close();
    }
    logger.log("✅ RTC Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.log("🔄 RTC Server shutting down gracefully...");
  server.close(() => {
    if (worker) {
      worker.close();
    }
    logger.log("✅ RTC Server closed");
    process.exit(0);
  });
});
