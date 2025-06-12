const jwt = require('jsonwebtoken');

const verifyToken = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('인증 토큰이 필요합니다.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new Error('토큰이 만료되었습니다.'));
        }
        return next(new Error('유효하지 않은 토큰입니다.'));
    }
};

module.exports = { verifyToken }; 