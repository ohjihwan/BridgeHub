const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 이메일 설정 확인
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('이메일 설정이 필요합니다. .env 파일에 EMAIL_USER와 EMAIL_PASS를 설정해주세요.');
  process.exit(1);
}

// 인증 코드 저장을 위한 임시 저장소 (실제 프로덕션에서는 Redis나 DB 사용 권장)
const verificationCodes = new Map();

// 이메일 인증 코드 전송 엔드포인트
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 6자리 랜덤 인증 코드 생성
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // 인증 코드 저장
    verificationCodes.set(email, {
      code: verificationCode,
      timestamp: Date.now()
    });

    // 이메일 전송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'BridgeHub 이메일 인증',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>BridgeHub 이메일 인증</h2>
          <p>안녕하세요! BridgeHub 회원가입을 위한 인증 코드입니다.</p>
          <p style="font-size: 24px; font-weight: bold; color: #333; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">
            ${verificationCode}
          </p>
          <p>이 인증 코드는 3분 동안 유효합니다.</p>
          <p>감사합니다.</p>
        </div>
      `
    });

    res.json({ success: true, message: '인증 코드가 이메일로 전송되었습니다.' });
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).json({ success: false, message: '이메일 전송에 실패했습니다.' });
  }
});

// 인증 코드 확인 엔드포인트
app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, message: '인증 코드를 찾을 수 없습니다.' });
  }

  // 3분 제한 확인
  if (Date.now() - storedData.timestamp > 3 * 60 * 1000) {
    verificationCodes.delete(email);
    return res.status(400).json({ success: false, message: '인증 코드가 만료되었습니다.' });
  }

  if (storedData.code === code) {
    verificationCodes.delete(email);
    res.json({ success: true, message: '인증이 완료되었습니다.' });
  } else {
    res.status(400).json({ success: false, message: '잘못된 인증 코드입니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 