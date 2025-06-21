const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = (req, res, next) => {
    try {
        // Authorization 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '유효하지 않은 토큰 형식입니다.' });
        }

        // 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '토큰이 만료되었습니다.' });
        }
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
}; 