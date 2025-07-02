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
const { Server } = require('socket.io');
const authMiddleware = require('./src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const socketService = require('./src/services/socketService');
const mongoService = require('./src/services/mongoService');
const ChatHandler = require('./src/socket/chatHandler');
const { 
    handleJoinStudy, 
    handleSendMessage, 
    handleFileUploadComplete,
    handleGetSystemStatus,
    handleForceReconnect,
    handleKickMember,
    messageQueue,
    connectionManager
} = require('./src/controllers/socketController');

// 환경 변수 설정
const PORT = process.env.PORT || 7500;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
    "http://localhost:7000", 
    "http://localhost:7700",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ["*"]
    },
    allowEIO3: true,
    transports: ['websocket', 'polling']
});

// Socket.IO 인스턴스를 socketService에 전달
socketService.setSocketIO(io);

// ChatHandler 인스턴스 생성 및 초기화 (모든 소켓 이벤트 처리)
const chatHandler = new ChatHandler(io);

// 스터디별 소켓 연결 관리
const studySockets = new Map();

// 인증 미들웨어 적용
io.use(authMiddleware);

// 에러 처리 미들웨어
io.use((socket, next) => {
    socket.on('error', (error) => {
        console.error('소켓 에러:', error);
    });
    next();
});

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        service: 'BridgeHub Socket Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 헬스 체크 엔드포인트
app.get('/health', async (req, res) => {
    try {
        const mongoHealth = await mongoService.healthCheck();
        res.json({
            status: 'healthy',
            services: {
                socket: 'running',
                mongodb: mongoHealth.status,
                java_api: connectionManager.isConnected ? 'connected' : 'disconnected'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 미들웨어 설정
app.use(cors({
    origin: CORS_ORIGINS,
    credentials: true
}));
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// 강퇴 API 엔드포인트
app.post('/api/socket/kick-member', async (req, res) => {
    try {
        const { roomId, memberId } = req.body;
        console.log(`강퇴 API 호출: roomId=${roomId}, memberId=${memberId}`);
        
        await handleKickMember(roomId, memberId);
        
        res.json({ 
            success: true, 
            message: '강퇴 처리가 완료되었습니다.' 
        });
    } catch (error) {
        console.error('강퇴 API 처리 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 스터디룸 삭제 API 엔드포인트
app.post('/api/socket/delete-study', async (req, res) => {
    try {
        const { studyId, roomId } = req.body;
        console.log(`스터디룸 삭제 API 호출: studyId=${studyId}, roomId=${roomId}`);
        
        await handleDeleteStudy(studyId, roomId);
        
        res.json({ 
            success: true, 
            message: '스터디룸 삭제 처리가 완료되었습니다.' 
        });
    } catch (error) {
        console.error('스터디룸 삭제 API 처리 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 스터디룸 업데이트 알림 API
app.post('/api/socket/study-room-update', async (req, res) => {
    try {
        const { action, studyRoom } = req.body;
        console.log(`스터디룸 업데이트 API 호출: action=${action}, studyRoomId=${studyRoom?.studyRoomId}`);
        
        // 소켓 서비스를 통해 모든 클라이언트에게 알림 전송
        socketService.broadcastStudyRoomUpdate(action, studyRoom);
        
        res.json({ 
            success: true, 
            message: '스터디룸 업데이트 알림이 전송되었습니다.' 
        });
    } catch (error) {
        console.error('스터디룸 업데이트 API 처리 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ChatHandler가 모든 소켓 이벤트를 처리합니다
console.log('🚀 ChatHandler가 모든 소켓 이벤트를 처리합니다.');

// 서버 에러 처리
server.on('error', (error) => {
    console.error('서버 에러:', error);
});

process.on('uncaughtException', (error) => {
    console.error('처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 Promise 거부:', reason);
});

// 정상 종료 처리
process.on('SIGTERM', () => {
    console.log('서버 종료 신호 수신...');
    connectionManager.cleanup();
    server.close(() => {
        console.log('서버가 정상적으로 종료되었습니다.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('서버 종료 신호 수신...');
    connectionManager.cleanup();
    server.close(() => {
        console.log('서버가 정상적으로 종료되었습니다.');
        process.exit(0);
    });
});

// 서버 시작
async function startServer() {
    try {
        // MongoDB 서비스 초기화
        await mongoService.initialize();
        
        server.listen(PORT,() => {
            console.log(`🚀 소켓 서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`📡 API 서버 URL: ${API_BASE_URL}`);
            console.log(`🌐 CORS Origins: ${CORS_ORIGINS.join(', ')}`);
            console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '설정됨' : '기본값 사용'}`);
            console.log(`💬 ChatHandler가 초기화되었습니다.`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer(); 