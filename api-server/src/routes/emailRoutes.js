const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 인증 코드 저장을 위한 임시 저장소
const verificationCodes = new Map();

// 인증 코드 생성 함수
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// JWT 토큰 생성 함수
function generateToken(email) {
    return jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
}

// 이메일 인증 코드 전송
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('이메일 인증 요청:', email);
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: '이메일 주소가 필요합니다.' 
            });
        }

        const verificationCode = generateVerificationCode();
        console.log('생성된 인증 코드:', verificationCode);
        
        verificationCodes.set(email, {
            code: verificationCode,
            timestamp: Date.now()
        });
        console.log('저장된 인증 데이터:', verificationCodes.get(email));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'BridgeHub 이메일 인증',
            html: `
                <h1>BridgeHub 이메일 인증</h1>
                <p>안녕하세요! BridgeHub 서비스 가입을 위한 인증 코드입니다.</p>
                <h2>인증 코드: ${verificationCode}</h2>
                <p>이 인증 코드는 10분 동안 유효합니다.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('이메일 전송 완료');
        return res.status(200).json({ 
            success: true,
            message: '인증 이메일이 전송되었습니다.',
            data: {
                email: email
            }
        });
    } catch (error) {
        console.error('이메일 전송 에러:', error);
        return res.status(500).json({ 
            success: false,
            error: '이메일 전송에 실패했습니다.' 
        });
    }
});

// 인증 코드 확인
router.post('/verify-code', (req, res) => {
    const { email, code } = req.body;
    console.log('인증 시도:', { email, code });
    console.log('저장된 인증 코드:', verificationCodes.get(email));

    if (!email || !code) {
        return res.status(400).json({ 
            success: false,
            error: '이메일과 인증 코드가 필요합니다.' 
        });
    }

    const verificationData = verificationCodes.get(email);
    
    if (!verificationData) {
        console.log('인증 데이터 없음');
        return res.status(400).json({ 
            success: false,
            error: '인증 코드가 만료되었거나 존재하지 않습니다.' 
        });
    }

    // 10분 제한 확인
    if (Date.now() - verificationData.timestamp > 10 * 60 * 1000) {
        console.log('인증 코드 만료');
        verificationCodes.delete(email);
        return res.status(400).json({ 
            success: false,
            error: '인증 코드가 만료되었습니다.' 
        });
    }

    console.log('코드 비교:', { 
        입력된코드: code, 
        저장된코드: verificationData.code,
        일치여부: verificationData.code === code 
    });

    if (verificationData.code === code) {
        console.log('인증 성공, 토큰 생성');
        verificationCodes.delete(email);
        // 인증 성공 시 JWT 토큰 생성
        const token = generateToken(email);
        console.log('생성된 토큰:', token);
        
        // 성공 응답
        return res.status(200).json({ 
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            data: {
                token: token,
                email: email
            }
        });
    } else {
        console.log('잘못된 인증 코드');
        return res.status(400).json({ 
            success: false,
            error: '잘못된 인증 코드입니다.' 
        });
    }
});

module.exports = router; 