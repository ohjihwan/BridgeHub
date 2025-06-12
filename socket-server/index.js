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

const app = express();
const server = http.createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
    cors: {
        origin: "*",
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

// 소켓 연결 처리
io.on('connection', (socket) => {
    console.log('클라이언트 연결됨:', socket.id);

    // 채팅방 참여
    socket.on('join-chat', async (data) => {
        try {
            const { studyId, userId } = data;
            if (!studyId || !userId) {
                throw new Error('스터디 ID와 사용자 ID가 필요합니다.');
            }

            // 스터디 정보 확인
            const response = await axios.get(`${API_BASE_URL}/study/${studyId}`);
            if (!response.data.success) {
                throw new Error('스터디를 찾을 수 없습니다.');
            }

            // 스터디 소켓 그룹에 참여
            socket.join(studyId);
            
            // 스터디별 소켓 관리
            if (!studySockets.has(studyId)) {
                studySockets.set(studyId, new Set());
            }
            studySockets.get(studyId).add(socket.id);

            // 참여자 수 업데이트
            const memberCount = studySockets.get(studyId).size;
            io.to(studyId).emit('member-count', {
                count: memberCount,
                capacity: response.data.data.capacity
            });

            // 시스템 메시지 전송
            io.to(studyId).emit('new-message', {
                userId: '시스템',
                content: `${userId}님이 입장하셨습니다.`,
                timestamp: new Date().toISOString()
            });

            console.log('채팅방 참여 성공:', { studyId, userId, memberCount });
        } catch (error) {
            console.error('채팅방 참여 실패:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // 메시지 전송
    socket.on('send-message', async (data) => {
        try {
            const { studyId, userId, message } = data;
            if (!studyId || !userId || !message) {
                throw new Error('스터디 ID, 사용자 ID, 메시지가 필요합니다.');
            }

            // 메시지 저장
            const messageData = {
                userId,
                content: message,
                timestamp: new Date().toISOString()
            };

            await axios.post(`${API_BASE_URL}/study/${studyId}/messages`, messageData);

            // 메시지 브로드캐스트
            io.to(studyId).emit('new-message', messageData);
            console.log('메시지 전송 성공:', { studyId, userId });
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // 연결 해제
    socket.on('disconnect', () => {
        console.log('클라이언트 연결 해제:', socket.id);
        
        // 스터디별 소켓 관리에서 제거
        studySockets.forEach((sockets, studyId) => {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                // 참여자 수 업데이트
                const memberCount = sockets.size;
                io.to(studyId).emit('member-count', {
                    count: memberCount,
                    capacity: 0
                });
            }
        });
    });
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// 서버 시작
server.listen(PORT, () => {
    console.log(`소켓 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 