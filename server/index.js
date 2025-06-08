/**
 * BridgeHub 서버 메인 파일
 * 이메일 인증 및 사용자 인증을 처리하는 서버입니다.
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const studyRoutes = require('./src/routes/studyRoutes');
const emailRoutes = require('./src/routes/emailRoutes');
const ChatHandler = require('./src/socket/chatHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"]
    },
    transports: ['websocket', 'polling']
});

const port = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
    credentials: true
}));

app.use(express.json());

// 정적 파일 제공 설정
app.use('/test', express.static(path.join(__dirname, 'test')));

// API 라우터 설정
app.use('/api/study', studyRoutes);
app.use('/api/email', emailRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'BridgeHub 서버가 실행 중입니다.' });
});

// WebSocket 핸들러 설정
new ChatHandler(io);

// 서버 시작
server.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 