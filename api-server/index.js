/**
 * BridgeHub 서버 메인 파일
 * 이메일 인증 및 사용자 인증을 처리하는 서버입니다.
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');

const emailRoutes = require('./src/routes/emailRoutes');
const studyRoutes = require('./src/routes/studyRoutes');
const fileRoutes = require('./src/routes/fileRoutes');

const app = express();
const server = http.createServer(app);

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const port = process.env.PORT || 7100;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 미들웨어 설정
app.use(cors({
    origin: "*",  // 모든 origin 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 정적 파일 제공 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/test', express.static(path.join(__dirname, 'test')));

// 라우트 등록
app.use('/api/email', emailRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/study', fileRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'BridgeHub API 서버가 실행 중입니다.' });
});

// 서버 시작
server.listen(port, () => {
    console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 