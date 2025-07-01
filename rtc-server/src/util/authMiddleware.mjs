import { getSpringClient } from '../service/springClient.mjs';
import * as logger from './logger.mjs';

const springClient = getSpringClient();

export default async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    const username = socket.handshake.auth.username;
    const ip = socket.handshake.address;

    logger.debug(`Authentication attempt for socket ${socket.id}`, {
      hasToken: !!token,
      username: username,
      ip: ip
    });

    // 테스트/로컬 환경: 토큰만 있으면 무조건 허용, 또는 localhost IP면 허용
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL === 'true' || ip.startsWith('::1') || ip.startsWith('127.0.0.1')) {
      if (token) {
        socket.user = {
          id: socket.id,
          username: username || 'Anonymous',
          role: 'user',
          authenticated: true,
          token: token
        };
        logger.warn(`Dev/local mode: token만 있으면 입장 허용 for ${socket.id}`);
        return next();
      } else if (ip.startsWith('::1') || ip.startsWith('127.0.0.1')) {
        socket.user = {
          id: socket.id,
          username: username || 'Anonymous',
          role: 'user',
          authenticated: false
        };
        logger.warn(`Dev/local mode: localhost IP로 입장 허용 for ${socket.id}`);
        return next();
      }
    }

    // 실제 배포 환경: 기존 토큰 검증 로직
    if (!token) {
      logger.warn(`Authentication failed: No token provided for ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    const validationResult = await springClient.validateToken(token);
    if (validationResult.valid) {
      socket.user = {
        ...validationResult.user,
        authenticated: true,
        token: token
      };
      logger.log(`User authenticated successfully: ${socket.user.username || socket.user.id} (${socket.id})`);
      next();
    } else {
      logger.warn(`Authentication failed for ${socket.id}: ${validationResult.error}`);
      next(new Error(`Authentication error: ${validationResult.error}`));
    }
  } catch (error) {
    logger.error(`Authentication error for ${socket.id}:`, error);
    next(new Error('Authentication error: Internal server error'));
  }
}
