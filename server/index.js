/**
 * BridgeHub 서버 메인 파일
 * 이메일 인증 및 사용자 인증을 처리하는 서버입니다.
 */
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

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

// 이메일 유효성 검사 함수
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 이메일 인증 코드 전송 엔드포인트
app.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 이메일 유효성 검사
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '유효한 이메일 주소를 입력해주세요.' 
      });
    }

    // 이미 인증 중인 이메일인지 확인
    if (verificationCodes.has(email)) {
      const storedData = verificationCodes.get(email);
      // 1분 이내 재시도 방지
      if (Date.now() - storedData.timestamp < 60 * 1000) {
        return res.status(429).json({ 
          success: false, 
          message: '잠시 후 다시 시도해주세요.' 
        });
      }
    }
    
    // 6자리 랜덤 인증 코드 생성
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const token = crypto.randomBytes(32).toString('hex');
    
    // 인증 코드 저장
    verificationCodes.set(email, {
      code: verificationCode,
      token: token,
      timestamp: Date.now()
    });

    // 이메일 전송
    await transporter.sendMail({
      from: {
        name: 'BridgeHub',
        address: process.env.EMAIL_USER
      },
      replyTo: process.env.EMAIL_USER,
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
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            이 이메일은 BridgeHub에서 발송되었습니다.<br>
            본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
          </p>
        </div>
      `
    });

    res.json({ 
      success: true, 
      message: '인증 코드가 이메일로 전송되었습니다.',
      token: token
    });
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' 
    });
  }
});

// 인증 코드 확인 엔드포인트
app.post('/verify-email', (req, res) => {
  try {
    const { email, code, token } = req.body;
    
    // 필수 파라미터 검증
    if (!email || !code || !token) {
      return res.status(400).json({ 
        success: false, 
        message: '필수 정보가 누락되었습니다.' 
      });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: '인증 코드를 찾을 수 없습니다.' 
      });
    }

    // 토큰 검증
    if (storedData.token !== token) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 인증 요청입니다.' 
      });
    }

    // 3분 제한 확인
    if (Date.now() - storedData.timestamp > 3 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: '인증 코드가 만료되었습니다.' 
      });
    }

    if (storedData.code === code) {
      verificationCodes.delete(email);
      res.json({ 
        success: true, 
        message: '인증이 완료되었습니다.' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: '잘못된 인증 코드입니다.' 
      });
    }
  } catch (error) {
    console.error('인증 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 