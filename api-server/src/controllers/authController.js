const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {
    try {
        const { userid, password, name, phone, gender, education, nickname } = req.body;

        // 아이디 중복 체크
        const existingUser = await User.findByUserid(userid);
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: '이미 존재하는 아이디입니다.' 
            });
        }

        // 사용자 생성
        const userId = await User.createUser({ userid, password, name, phone, gender, education, nickname });

        // JWT 토큰 생성
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                token,
                user: {
                    id: userId,
                    userid,
                    name,
                    phone,
                    gender,
                    education,
                    nickname
                }
            }
        });
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ 
            success: false,
            error: '서버 에러가 발생했습니다.' 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { userid, password } = req.body;

        // 사용자 찾기
        const user = await User.findByUserid(userid);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // 비밀번호 검증
        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign({ 
            userId: user.id,
            userid: user.userid,
            nickname: user.nickname,
            name: user.name
        }, JWT_SECRET, { expiresIn: '24h' });

        console.log('토큰 생성 데이터:', {
            userId: user.id,
            userid: user.userid,
            nickname: user.nickname,
            name: user.name
        });

        // 토큰 검증 테스트
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('토큰 검증 결과:', decoded);

        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user: {
                    id: user.id,
                    userid: user.userid,
                    name: user.name,
                    phone: user.phone,
                    gender: user.gender,
                    education: user.education,
                    nickname: user.nickname
                }
            }
        });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ 
            success: false,
            error: '서버 에러가 발생했습니다.' 
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = await authService.refreshToken(refreshToken);
        const tokens = authService.generateTokens(userId);

        res.json({
            success: true,
            data: tokens
        });
    } catch (error) {
        res.status(401).json({ 
            success: false,
            error: error.message 
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.json({ 
            success: true,
            message: '로그아웃이 완료되었습니다.' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: '사용자를 찾을 수 없습니다.' 
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    userid: user.userid,
                    name: user.name,
                    phone: user.phone,
                    gender: user.gender,
                    education: user.education,
                    nickname: user.nickname
                }
            }
        });
    } catch (error) {
        console.error('프로필 조회 에러:', error);
        res.status(500).json({ 
            success: false,
            error: '서버 에러가 발생했습니다.' 
        });
    }
}; 