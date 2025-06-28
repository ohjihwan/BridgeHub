import jwt from 'jsonwebtoken';
import { validateUserToken } from './springClient.mjs';  // :contentReference[oaicite:23]{index=23}

// Socket.IO 인증
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

// REST API 인증
export async function jwtAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'AUTH_REQUIRED' });
  }
  try {
    const userInfo = await validateUserToken(token);
    req.user = userInfo;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'AUTH_ERROR' });
  }
}