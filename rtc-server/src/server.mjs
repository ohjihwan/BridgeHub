import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import { Server as IOServer } from 'socket.io';
import router from './router.mjs';
import bindSignaling from './signaling/index.mjs';
import socketService from '../../socket-server/src/services/socketService.js';
import { RTC_PORT, NODE_ENV, SSL_KEY_PATH, SSL_CERT_PATH } from './config/index.mjs';

(async () => {
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use('/api/rtc', router);

  let server;
  if (NODE_ENV === 'development') {
    // 개발 모드: HTTP
    server = http.createServer(expressApp);
    console.log('Development mode: HTTP server on port', RTC_PORT);
  } else {
    // 운영 모드: HTTPS
    server = https.createServer({
      key:  fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    }, expressApp);
    console.log('Production mode: HTTPS server on port', RTC_PORT);
  }

  // Mediasoup Worker
  const { createWorker } = await import('mediasoup');
  const worker = await createWorker();
  console.log('mediasoup Worker PID:', worker.pid);

  // Socket.IO
  const io = new IOServer(server, {
    path: '/socket.io',
    cors: { origin: '*' }
  });

  // 1) 기존 소켓 서비스 공유
  socketService.setSocketIO(io);
  // 2) RTC 네임스페이스
  const rtcNs = io.of('/rtc');
  await bindSignaling(rtcNs, worker);

  server.listen(RTC_PORT);
})();
