const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || '5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';

/**
 * JWT 토큰 검증 함수
 * Java 서버에서 생성된 토큰을 검증합니다.
 */
const verifyToken = async (token) => {
    try {
        // JWT 토큰 검증 (Java 서버와 동일한 시크릿 키 사용)
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 토큰에서 사용자 정보 추출 (Java 서버의 JWT 구조와 일치)
        return {
            userId: decoded.userId || decoded.username,
            username: decoded.username,
            nickname: decoded.nickname,
            email: decoded.email,
            memberId: decoded.memberId,
            role: decoded.role || 'USER'
        };
    } catch (error) {
        console.error('JWT 토큰 검증 실패:', error.message);
        
        // 토큰 만료
        if (error.name === 'TokenExpiredError') {
            throw new Error('토큰이 만료되었습니다.');
        }
        
        // 토큰 형식 오류
        if (error.name === 'JsonWebTokenError') {
            throw new Error('유효하지 않은 토큰입니다.');
        }
        
        throw new Error('인증에 실패했습니다.');
    }
};

/**
 * Java 서버에 토큰 유효성 추가 검증 (선택적)
 * 필요시 Java 서버의 /api/auth/validate 엔드포인트 호출
 */
const validateTokenWithJavaServer = async (token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/validate`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        return response.data.success;
    } catch (error) {
        console.warn('Java 서버 토큰 검증 실패 (로컬 검증으로 대체):', error.message);
        return true; // 실패시 로컬 검증 결과 사용
    }
};

module.exports = (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        console.log('인증 토큰이 없습니다.');
        return next(new Error('인증 토큰이 필요합니다.'));
    }

    verifyToken(token)
        .then(async (user) => {
            console.log('사용자 인증 성공:', { 
                userId: user.userId, 
                username: user.username,
                memberId: user.memberId 
            });
            
            // 소켓에 사용자 정보 저장
            socket.user = user;
            socket.userId = user.userId;
            socket.memberId = user.memberId;
            socket.username = user.username;
            
            next();
        })
        .catch(error => {
            console.error('사용자 인증 실패:', error.message);
            next(new Error(error.message));
        });
}; 