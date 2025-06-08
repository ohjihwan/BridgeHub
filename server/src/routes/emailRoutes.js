const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// 이메일 인증 코드 전송
router.post('/send-verification', emailController.sendVerificationCode);

// 이메일 인증 코드 확인
router.post('/verify-email', emailController.verifyEmail);

module.exports = router; 