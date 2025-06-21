const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');

// 이메일 인증 코드 전송
router.post('/send-verification', async (req, res) => {
    console.log('이메일 인증 요청:', req.body);
    const { email } = req.body;
    
    if (!email) {
        console.log('이메일 주소 누락');
        return res.status(400).json({ 
            success: false,
            error: '이메일 주소가 필요합니다.' 
        });
    }

    try {
        const result = await emailService.sendVerificationEmail(email);
        if (result.success) {
            return res.status(200).json({ 
                success: true,
                message: result.message || '인증 이메일이 전송되었습니다.'
            });
        } else {
            return res.status(500).json(result);
        }
    } catch (error) {
        console.error('이메일 전송 에러:', error);
        return res.status(500).json({
            success: false,
            error: '이메일 전송 중 오류가 발생했습니다.'
        });
    }
});

// 인증 코드 확인
router.post('/verify-code', (req, res) => {
    console.log('인증 코드 확인 요청:', req.body);
    const { email, code } = req.body;
    
    if (!email || !code) {
        return res.status(400).json({
            success: false,
            error: '이메일과 인증 코드가 필요합니다.'
        });
    }

    const result = emailService.verifyCode(email, code);
    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
});

// 회원가입
router.post('/signup', authController.signup);

// 로그인
router.post('/login', authController.login);

// 프로필 조회 (인증 필요)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router; 