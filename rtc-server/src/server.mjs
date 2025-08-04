import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import rtcRoutes from './routes/rtcRoutes.mjs';
import { handleSocketEvents } from './signaling/index.mjs';

dotenv.config();

const app = express();

// ✅ 공통 미들웨어
app.use(cors());
app.use(express.json());

// ✅ REST API 라우팅 (/api/rtc)
app.use('/api/rtc', rtcRoutes);

// ✅ HTTP + WebSocket 통합 서버 구성
const httpServer = createServer(app);

// ✅ Socket.IO 서버 설정
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ 소켓 연결 처리
io.on('connection', (socket) => {
  const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress;
  console.log(`🔌 새 소켓 연결: ${socket.id} (${ip})`);

  // socket.data 초기화
  socket.data.roomId = null;
  socket.data.nickname = null;

  handleSocketEvents(io, socket);
});

// ✅ 서버 실행
const PORT = process.env.PORT || 7600;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ RTC 서버 실행 중: http://0.0.0.0:${PORT}`);
  console.log(`🌐 외부 접속 가능: 모든 IP에서 접근 가능`);
});
