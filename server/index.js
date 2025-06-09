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
const fs = require('fs');

const studyRoutes = require('./src/routes/studyRoutes');
const emailRoutes = require('./src/routes/emailRoutes');
const ChatHandler = require('./src/socket/chatHandler');

const app = express();
const server = http.createServer(app);

// uploads 디렉토리 생성
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Socket.IO 서버 설정
const io = new Server(server, {
    cors: {
        origin: "*",  // 모든 origin 허용
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,  // Engine.IO 3 프로토콜 허용
    pingTimeout: 60000,  // ping 타임아웃 설정
    pingInterval: 25000  // ping 간격 설정
});

const port = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors({
    origin: "*",  // 모든 origin 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 정적 파일 제공 설정
app.use('/test', express.static(path.join(__dirname, 'test')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.set('Content-Disposition', 'attachment');
    }
}));

// 파일 다운로드 라우트 추가
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('파일 다운로드 에러:', err);
            res.status(404).send('파일을 찾을 수 없습니다.');
        }
    });
});

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