const express = require('express');
const router = express.Router();

// 이메일 인증 코드 전송
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: '이메일 주소가 필요합니다.' });
        }

        // 이메일 전송 로직은 index.js에 이미 구현되어 있으므로 여기서는 라우팅만 처리
        res.json({ message: '이메일 인증 요청이 처리되었습니다.' });
    } catch (error) {
        console.error('이메일 전송 에러:', error);
        res.status(500).json({ error: '이메일 전송에 실패했습니다.' });
    }
});

// 인증 코드 확인
router.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: '이메일과 인증 코드가 필요합니다.' });
    }

    // 인증 코드 확인 로직은 index.js에 이미 구현되어 있으므로 여기서는 라우팅만 처리
    res.json({ message: '인증 코드 확인 요청이 처리되었습니다.' });
});

module.exports = router; 