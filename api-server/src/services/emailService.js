const nodemailer = require('nodemailer');
require('dotenv').config();

// 환경 변수 체크
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('이메일 설정이 누락되었습니다. .env 파일을 확인해주세요.');
    process.exit(1);
}

// 인증 코드 저장소
const verificationCodes = new Map();

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 인증 코드 생성
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 이메일 인증 코드 전송
async function sendVerificationEmail(email) {
    try {
        if (!email) {
            return { 
                success: false, 
                error: '이메일 주소가 필요합니다.' 
            };
        }

        const verificationCode = generateVerificationCode();
        verificationCodes.set(email, {
            code: verificationCode,
            timestamp: Date.now()
        });

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
        return { 
            success: true,
            message: '인증 이메일이 전송되었습니다.'
        };
    } catch (error) {
        console.error('이메일 전송 에러:', error);
        return { 
            success: false, 
            error: '이메일 전송에 실패했습니다. 이메일 주소를 확인해주세요.' 
        };
    }
}

// 인증 코드 확인
function verifyCode(email, code) {
    if (!email || !code) {
        return { 
            success: false, 
            error: '이메일과 인증 코드가 필요합니다.' 
        };
    }

    const verificationData = verificationCodes.get(email);
    if (!verificationData) {
        return { 
            success: false, 
            error: '인증 코드가 만료되었거나 존재하지 않습니다.' 
        };
    }

    if (Date.now() - verificationData.timestamp > 10 * 60 * 1000) {
        verificationCodes.delete(email);
        return { 
            success: false, 
            error: '인증 코드가 만료되었습니다.' 
        };
    }

    if (verificationData.code === code) {
        verificationCodes.delete(email);
        return { 
            success: true, 
            message: '이메일 인증이 완료되었습니다.' 
        };
    }

    return { 
        success: false, 
        error: '잘못된 인증 코드입니다.' 
    };
}

module.exports = {
    sendVerificationEmail,
    verifyCode
}; 