import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import { Server as IOServer } from 'socket.io';
import 'dotenv/config';

const app = express();
const port = process.env.RTC_PORT || 7600;

let server;
if (process.env.NODE_ENV === 'production') {
  // 운영(EC2) 환경: SSL 직접 로딩
  const key = fs.readFileSync(process.env.SSL_KEY_PATH);
  const cert = fs.readFileSync(process.env.SSL_CERT_PATH);
  server = https.createServer({ key, cert }, app);
  console.log('[RTC] Running in production mode with HTTPS');
} else {
  // 개발 환경: HTTP만 사용
  server = http.createServer(app);
  console.log('[RTC] Running in development mode with HTTP');
}

const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL || '*' }
});

// … 기존 SFU 초기화 로직 …

server.listen(port, () => {
  console.log(`RTC server listening on port ${port}`);
});
