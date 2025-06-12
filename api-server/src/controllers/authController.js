const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authService = require('../services/authService');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        const tokens = authService.generateTokens(user._id);

        res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            ...tokens
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        const tokens = authService.generateTokens(user._id);

        res.json({
            message: '로그인이 완료되었습니다.',
            ...tokens
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = await authService.refreshToken(refreshToken);
        const tokens = authService.generateTokens(userId);

        res.json(tokens);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.json({ message: '로그아웃이 완료되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}; 