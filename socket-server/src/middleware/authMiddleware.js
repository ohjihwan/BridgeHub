const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || '5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437';
const API_URL = process.env.API_URL || 'http://localhost:7100';

const verifyToken = async (token) => {
    try {
        // JWT 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 토큰에서 사용자 정보 추출
        return {
            userId: decoded.userId,
            username: decoded.username,
            nickname: decoded.nickname,
            email: decoded.email,
            role: decoded.role
        };
    } catch (error) {
        console.error('JWT 토큰 검증 실패:', error.message);
        throw new Error('인증에 실패했습니다.');
    }
};

module.exports = (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        console.log('인증 토큰이 없습니다.');
        return next(new Error('인증 토큰이 필요합니다.'));
    }

    verifyToken(token)
        .then(user => {
            console.log('사용자 인증 성공:', { userId: user.userId, role: user.role });
            socket.user = user;
            socket.userId = user.userId;
            next();
        })
        .catch(error => {
            console.error('사용자 인증 실패:', error.message);
            next(error);
        });
}; 