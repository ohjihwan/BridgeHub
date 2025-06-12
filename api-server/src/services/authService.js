const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
    // 토큰 생성
    generateTokens(userId) {
        const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    // 회원가입
    async register(userData) {
        const { email, password, name } = userData;

        // 이메일 중복 체크
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('이미 등록된 이메일입니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();
        return user;
    }

    // 로그인
    async login(email, password) {
        // 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        return user;
    }

    // 토큰 갱신
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('리프레시 토큰이 필요합니다.');
        }

        // 리프레시 토큰 검증
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        return decoded.userId;
    }

    // 사용자 정보 조회
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        return user;
    }

    // 토큰 검증
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('토큰이 만료되었습니다.');
            }
            throw new Error('유효하지 않은 토큰입니다.');
        }
    }
}

module.exports = new AuthService(); 