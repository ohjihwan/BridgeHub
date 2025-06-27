// src/util/authMiddleware.mjs
import jwt from 'jsonwebtoken';
import { validateUserToken } from '../service/springClient.mjs';

// 1) Socket.IO 인증 미들웨어 (default export)
export default function socketAuth(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('AUTH_REQUIRED'));
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    return next();
  } catch {
    return next(new Error('AUTH_ERROR'));
  }
}

// 2) REST API용 JWT 인증 미들웨어 (named export)
export async function jwtAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'AUTH_REQUIRED', data: null });
  }
  try {
    // 스프링 백엔드로 토큰 검증
    const userInfo = await validateUserToken(token);
    req.user = userInfo;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'AUTH_ERROR', data: null });
  }
}
