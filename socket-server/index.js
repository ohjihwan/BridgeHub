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
const socketRouter = require('./src/routers/socketRouter');
const { Server } = require('socket.io');
const authMiddleware = require('./src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const API_BASE_URL = 'http://localhost:7100/api';
const PORT = process.env.PORT || 7500;

// 스터디별 소켓 연결 관리
const studySockets = new Map();

// 인증 미들웨어 적용
io.use(authMiddleware);

// 기본 라우트
app.get('/', (req, res) => {
    res.send('BridgeHub 소켓 서버가 실행 중입니다.');
});

// 소켓 핸들러 설정
socketRouter(io);

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// 스터디별 소켓 룸 관리
const studyRooms = new Map();

// 소켓 연결 처리
io.on('connection', (socket) => {
    console.log('클라이언트 연결됨:', socket.id);

    // 토큰 검증
    const token = socket.handshake.auth.token;
    if (!token) {
        console.error('토큰 없음');
        socket.disconnect();
        return;
    }

    try {
        console.log('토큰 파싱 시작:', token);
        const decoded = jwt.verify(token, 'your-secret-key');
        console.log('토큰 디코딩 결과:', decoded);
        
        // 토큰에서 사용자 정보 추출
        const userId = decoded.userId;
        const userid = decoded.userid || userId;  // userid가 없으면 userId 사용
        const nickname = decoded.nickname || userid;  // nickname이 없으면 userid 사용
        const name = decoded.name || userid;  // name이 없으면 userid 사용
        
        console.log('사용자 인증 성공:', { userId, userid, nickname, name });

        // 소켓에 사용자 정보 저장
        socket.userId = userId;
        socket.userid = userid;
        socket.nickname = nickname;
        socket.name = name;

        // 스터디 참여
        socket.on('join-study', async (data) => {
            try {
                const { studyId, userId, nickname } = data;
                console.log('스터디 참여 시도:', { studyId, userId, nickname });

                if (!studyId || !userId) {
                    throw new Error('필수 정보가 누락되었습니다.');
                }

                // 스터디 룸 생성 또는 가져오기
                if (!studyRooms.has(studyId)) {
                    studyRooms.set(studyId, new Set());
                }
                const studyRoom = studyRooms.get(studyId);

                // 소켓을 스터디 룸에 추가
                socket.join(studyId);
                studyRoom.add(socket.id);

                // 참여자 정보 저장
                socket.studyId = studyId;
                socket.userId = userId;
                socket.nickname = nickname;

                // 참여 메시지 전송
                io.to(studyId).emit('user-joined', {
                    userId,
                    nickname,
                    timestamp: new Date().toISOString()
                });

                console.log('스터디 참여 성공:', {
                    studyId,
                    userId,
                    nickname,
                    roomSize: studyRoom.size
                });

                socket.emit('join-study-success', {
                    message: '스터디 참여에 성공했습니다.',
                    studyId,
                    userId,
                    nickname
                });
            } catch (error) {
                console.error('스터디 참여 실패:', error);
                socket.emit('join-study-error', error.message);
            }
        });

        // 메시지 전송
        socket.on('send-message', (data) => {
            try {
                const { studyId, userId, nickname, message } = data;
                console.log('메시지 전송:', { studyId, userId, nickname, message });

                if (!studyId || !userId || !message) {
                    throw new Error('필수 정보가 누락되었습니다.');
                }

                // 스터디 룸의 모든 클라이언트에게 메시지 전송
                io.to(studyId).emit('receive-message', {
                    studyId,
                    userId,
                    nickname,
                    message,
                    timestamp: new Date().toISOString()
                });

                console.log('메시지 전송 성공:', {
                    studyId,
                    userId,
                    nickname,
                    message
                });
            } catch (error) {
                console.error('메시지 전송 실패:', error);
                socket.emit('error', error.message);
            }
        });

        // 파일 공유
        socket.on('send-file', (data) => {
            try {
                const { studyId, userId, nickname, fileInfo } = data;
                console.log('파일 공유:', { studyId, userId, nickname, fileInfo });

                if (!studyId || !userId || !fileInfo) {
                    throw new Error('필수 정보가 누락되었습니다.');
                }

                // 스터디 룸의 모든 클라이언트에게 파일 정보 전송
                io.to(studyId).emit('receive-file', {
                    studyId,
                    userId,
                    nickname,
                    fileInfo,
                    timestamp: new Date().toISOString()
                });

                console.log('파일 공유 성공:', {
                    studyId,
                    userId,
                    nickname,
                    fileInfo
                });
            } catch (error) {
                console.error('파일 공유 실패:', error);
                socket.emit('error', error.message);
            }
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log('클라이언트 연결 해제:', socket.id);
            
            if (socket.studyId) {
                const studyRoom = studyRooms.get(socket.studyId);
                if (studyRoom) {
                    studyRoom.delete(socket.id);
                    
                    // 퇴장 메시지 전송
                    io.to(socket.studyId).emit('user-left', {
                        userId: socket.userId,
                        nickname: socket.nickname,
                        timestamp: new Date().toISOString()
                    });

                    console.log('스터디 퇴장:', {
                        studyId: socket.studyId,
                        userId: socket.userId,
                        nickname: socket.nickname,
                        roomSize: studyRoom.size
                    });
                }
            }
        });

    } catch (error) {
        console.error('토큰 검증 실패:', error);
        socket.disconnect();
    }
});

// 서버 시작
server.listen(PORT, () => {
    console.log(`소켓 서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 