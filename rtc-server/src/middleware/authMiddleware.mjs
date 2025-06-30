import jwt from 'jsonwebtoken'
import { logger } from '../util/logger.mjs'

const JWT_SECRET = process.env.JWT_SECRET || '5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437'

export const authMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      logger.warn(`⚠️ No token provided for socket ${socket.id}`)
      // 개발 환경에서는 토큰 없이도 허용
      if (process.env.NODE_ENV === 'development') {
        socket.user = {
          userId: `guest-${socket.id}`,
          username: `Guest${socket.id.substring(0, 4)}`,
          nickname: `Guest${socket.id.substring(0, 4)}`,
        }
        return next()
      }
      return next(new Error('Authentication token required'))
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 사용자 정보를 소켓에 저장
    socket.user = {
      userId: decoded.userId || decoded.username,
      username: decoded.username,
      nickname: decoded.nickname,
      email: decoded.email,
    }

    logger.info(`✅ Authenticated user: ${socket.user.userId} (${socket.id})`)
    next()
  } catch (error) {
    logger.error(`❌ Authentication failed for socket ${socket.id}:`, error.message)
    
    // 개발 환경에서는 인증 실패해도 게스트로 허용
    if (process.env.NODE_ENV === 'development') {
      socket.user = {
        userId: `guest-${socket.id}`,
        username: `Guest${socket.id.substring(0, 4)}`,
        nickname: `Guest${socket.id.substring(0, 4)}`,
      }
      return next()
    }
    
    next(new Error('Invalid authentication token'))
  }
}
