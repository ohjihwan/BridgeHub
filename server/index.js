/**
 * BridgeHub 서버 메인 파일
 * 이메일 인증 및 사용자 인증을 처리하는 서버입니다.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const emailRoutes = require('./src/routes/emailRoutes');

const app = express();
const port = process.env.PORT || 3001;

// 미들웨어 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 라우터 설정
app.use('/', emailRoutes);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 