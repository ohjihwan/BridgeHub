const emailService = require('../services/emailService');
const crypto = require('crypto');

// 인증 코드 저장소 (실제 프로덕션에서는 Redis 등을 사용하는 것이 좋습니다)
const verificationCodes = new Map();

class EmailController {
    async sendVerificationCode(req, res) {
        const { email } = req.body;

        if (!email || !emailService.isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: '유효한 이메일 주소를 입력해주세요.'
            });
        }

        // 이미 인증 코드가 있는 경우
        if (verificationCodes.has(email)) {
            const storedData = verificationCodes.get(email);
            const now = Date.now();
            
            // 1분 이내에 재요청한 경우
            if (now - storedData.timestamp < 60000) {
                return res.status(429).json({
                    success: false,
                    message: '잠시 후 다시 시도해주세요.'
                });
            }
        }

        // 인증 코드 생성
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const token = crypto.randomBytes(32).toString('hex');

        // 인증 정보 저장
        verificationCodes.set(email, {
            code,
            token,
            timestamp: Date.now()
        });

        // 이메일 전송
        const emailSent = await emailService.sendVerificationEmail(email, code);
        
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: '이메일 전송에 실패했습니다.'
            });
        }

        res.json({
            success: true,
            message: '인증 코드가 이메일로 전송되었습니다.',
            token
        });
    }

    async verifyEmail(req, res) {
        const { email, code, token } = req.body;

        if (!email || !code || !token) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        const storedData = verificationCodes.get(email);

        if (!storedData || storedData.token !== token) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 인증 요청입니다.'
            });
        }

        // 5분 제한 시간 체크
        if (Date.now() - storedData.timestamp > 300000) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: '인증 시간이 만료되었습니다.'
            });
        }

        if (storedData.code !== code) {
            return res.status(400).json({
                success: false,
                message: '잘못된 인증 코드입니다.'
            });
        }

        // 인증 성공
        verificationCodes.delete(email);
        
        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });
    }
}

module.exports = new EmailController(); 