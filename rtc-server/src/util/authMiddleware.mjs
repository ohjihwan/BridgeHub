import jwt from 'jsonwebtoken';
import { validateUserToken } from '../service/springClient.mjs'; // Spring 검증 함수
import { error, log } from './logger.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function jwtAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  // 개발 모드에서 "테스트 토큰"이라면 로컬 검증
  if (process.env.NODE_ENV === 'development') {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = { userId: payload.userId, roles: payload.roles };
      log('[jwtAuth] Dev token verified:', req.user);
      return next();
    } catch (e) {
      log('[jwtAuth] Dev token invalid, fallback to Spring:', e.message);
      // fallthrough to Spring 검증
    }
  }

  // 프로덕션 혹은 Dev 모드 Spring 검증
  try {
    const userInfo = await validateUserToken(token);
    req.user = userInfo;  // Spring에서 {userId, roles…} 받아옴
    return next();
  } catch (e) {
    error('[jwtAuth] Spring token invalid:', e.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
