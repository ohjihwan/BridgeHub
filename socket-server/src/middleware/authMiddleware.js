const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const API_URL = process.env.API_URL || 'http://localhost:7100';

const verifyToken = async (token) => {
    try {
        // JWT 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // API 서버에서 사용자 정보 확인
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.user;
    } catch (error) {
        throw new Error('인증에 실패했습니다.');
    }
};

module.exports = (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('인증 토큰이 필요합니다.'));
    }

    verifyToken(token)
        .then(user => {
            socket.user = user;
            next();
        })
        .catch(error => {
            next(error);
        });
}; 