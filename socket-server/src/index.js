/**
 * BridgeHub 소켓 서버 메인 파일
 * 실시간 통신을 처리하는 서버입니다.
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const socketRouter = require('./src/routers/socketRouter');
const authMiddleware = require('./src/middleware/authMiddleware');
const {
    handleJoinStudy,
    handleSendMessage,
    handleFileUploadComplete,
    handleGetSystemStatus,
    handleForceReconnect,
    messageQueue,
    connectionManager
} = require('./src/controllers/socketController');
const socketService = require('./src/services/socketService');

const app = express();
const server = http.createServer(app);

// CORS origins: FRONTEND_URL (콤마 분리) 또는 기본 로컬 주소들
const origins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : (process.env.CORS_ORIGINS?.split(',') || [
      "http://localhost:7000",
      "http://localhost:7700",
      "http://127.0.0.1:5500",
      "http://localhost:5500"
    ]);

const io = new Server(server, {
    cors: {
        origin: origins,          // 환경변수로 설정 가능
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ["*"]
    },
    allowEIO3: true,
    transports: ['websocket', 'polling']
});

// Socket.IO 인스턴스를 socketService에 전달
socketService.setSocketIO(io);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';
// SOCKET_PORT 환경변수 사용 (기본 7500)
const PORT = process.env.SOCKET_PORT || 7500;

// 인증 미들웨어 적용 (활성화)
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
    res.send('BridgeHub 소켓 서버가 실행 중입니다.');
});

// 소켓 핸들러 설정
socketRouter(io);

// Express 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// 소켓 연결 처리
io.on('connection', (socket) => {
    console.log('새로운 클라이언트 연결:', socket.id);

    // 연결 시 초기 상태 전송
    socket.emit('connection-established', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    // 스터디룸 참가
    socket.on('join-study', (data) => {
        try {
            const { studyId, userId } = data;
            if (!studyId || !userId) {
                throw new Error('스터디 ID와 사용자 ID가 필요합니다.');
            }
            handleJoinStudy(socket, studyId, userId);
        } catch (error) {
            console.error('스터디룸 참가 처리 실패:', error);
            socket.emit('error', {
                message: '스터디룸 참가에 실패했습니다.',
                error: error.message
            });
        }
    });

    // 스터디룸 퇴장
    socket.on('leave-study', () => {
        try {
            const studyId = socket.currentStudyId;
            if (studyId) {
                socket.leave(studyId);
                delete socket.currentStudyId;

                // 다른 참가자들에게 퇴장 알림
                socket.to(studyId).emit('user-left', {
                    userId: socket.userId,
                    timestamp: new Date().toISOString()
                });

                console.log(`사용자 ${socket.userId}가 스터디 ${studyId}에서 퇴장했습니다.`);
            }
        } catch (error) {
            console.error('스터디룸 퇴장 처리 실패:', error);
            socket.emit('error', {
                message: '스터디룸 퇴장에 실패했습니다.',
                error: error.message
            });
        }
    });

    // 메시지 전송 (강화된 에러 처리)
    socket.on('send-message', (data) => {
        try {
            const { studyId, userId, message } = data;
            if (!studyId || !userId || !message) {
                throw new Error('필수 정보가 누락되었습니다.');
            }
            if (socket.currentStudyId !== studyId) {
                throw new Error('해당 스터디룸에 참가되어 있지 않습니다.');
            }
            handleSendMessage(socket, data);
        } catch (error) {
            console.error('메시지 전송 처리 실패:', error);
            socket.emit('error', {
                message: '메시지 전송에 실패했습니다.',
                error: error.message
            });
        }
    });

    // 파일 업로드 완료
    socket.on('file-upload-complete', (data) => {
        try {
            const { studyId, userId, fileInfo } = data;
            if (!studyId || !userId || !fileInfo) {
                throw new Error('파일 업로드 정보가 누락되었습니다.');
            }
            handleFileUploadComplete(socket, data);
        } catch (error) {
            console.error('파일 업로드 완료 처리 실패:', error);
            socket.emit('error', {
                message: '파일 업로드 완료 처리에 실패했습니다.',
                error: error.message
            });
        }
    });

    // 시스템 상태 조회
    socket.on('get-system-status', () => {
        handleGetSystemStatus(socket);
    });

    // 강제 재연결
    socket.on('force-reconnect', () => {
        handleForceReconnect(socket);
    });

    // 연결 해제
    socket.on('disconnect', (reason) => {
        try {
            console.log(`클라이언트 연결 해제: ${socket.id}, 이유: ${reason}`);

            // 스터디룸에서 퇴장 처리
            const studyId = socket.currentStudyId;
            if (studyId) {
                socket.to(studyId).emit('user-disconnected', {
                    userId: socket.userId,
                    timestamp: new Date().toISOString()
                });
            }

            // 소켓 정보 정리
            delete socket.currentStudyId;
            delete socket.userId;
        } catch (error) {
            console.error('연결 해제 처리 실패:', error);
        }
    });

    // 에러 이벤트 처리
    socket.on('error', (error) => {
        console.error('소켓 에러:', error);
    });
});

// 서버 에러 처리
server.on('error', (error) => {
    console.error('서버 에러:', error);
});

process.on('uncaughtException', (error) => {
    console.error('처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason) => {
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
server.listen(PORT, () => {
    console.log(`소켓 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`API 서버 URL: ${API_BASE_URL}`);
});
