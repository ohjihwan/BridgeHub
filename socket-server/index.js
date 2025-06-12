/**
 * BridgeHub 소켓 서버 메인 파일
 * 실시간 통신을 처리하는 서버입니다.
 */
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const setupSocketHandlers = require('./src/socket/socketRouter');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const API_BASE_URL = 'http://localhost:7100/api';
const PORT = process.env.PORT || 7500;

// 스터디별 소켓 연결 관리
const studySockets = new Map();

// 기본 라우트
app.get('/', (req, res) => {
    res.send('BridgeHub 소켓 서버가 실행 중입니다.');
});

// 소켓 핸들러 설정
setupSocketHandlers(io);

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// 서버 시작
server.listen(PORT, () => {
    console.log(`소켓 서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 