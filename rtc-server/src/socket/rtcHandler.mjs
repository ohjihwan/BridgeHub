import { logger } from '../util/logger.mjs'
import { authMiddleware } from '../middleware/authMiddleware.mjs'
import { RoomController } from '../controllers/roomController.mjs'
import { PeerController } from '../controllers/peerController.mjs'
import { MediaController } from '../controllers/mediaController.mjs'

export class RTCHandler {
  constructor(io, roomManager) {
    this.io = io
    this.roomManager = roomManager
    
    // 컨트롤러 초기화
    this.roomController = new RoomController(roomManager)
    this.peerController = new PeerController(roomManager)
    this.mediaController = new MediaController(roomManager)
    
    this.setupHandlers()
  }

  setupHandlers() {
    // 인증 미들웨어 적용
    this.io.use(authMiddleware)

    this.io.on('connection', (socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`)

      // Router RTP Capabilities 요청
      socket.on('getRouterRtpCapabilities', (callback) => {
        try {
          const capabilities = this.roomManager.router.rtpCapabilities
          if (typeof callback === 'function') {
            callback({ routerRtpCapabilities: capabilities })
          }
          logger.debug(`📡 Router RTP capabilities sent to ${socket.id}`)
        } catch (error) {
          logger.error('Get router capabilities error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // 방 참가
      socket.on('joinRoom', async (data, callback) => {
        try {
          const result = await this.roomController.handleJoinRoom(socket, data)
          if (typeof callback === 'function') {
            callback(result)
          }
        } catch (error) {
          logger.error('Join room error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // Transport 연결
      socket.on('connectTransport', async (data, callback) => {
        try {
          await this.peerController.handleConnectTransport(socket, data)
          if (typeof callback === 'function') {
            callback({ success: true })
          }
        } catch (error) {
          logger.error('Connect transport error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // Producer 생성
      socket.on('produce', async (data, callback) => {
        try {
          const result = await this.mediaController.handleProduce(socket, data)
          
          // 다른 참가자들에게 새 Producer 알림
          const peerInfo = this.roomManager.peers.get(socket.id)
          if (peerInfo) {
            socket.to(peerInfo.roomId).emit('newProducer', {
              producerId: result.id,
              peerId: peerInfo.peerId,
            })
          }

          if (typeof callback === 'function') {
            callback(result)
          }
        } catch (error) {
          logger.error('Produce error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // Consumer 생성
      socket.on('consume', async (data, callback) => {
        try {
          const result = await this.mediaController.handleConsume(socket, data)
          if (typeof callback === 'function') {
            callback(result)
          }
        } catch (error) {
          logger.error('Consume error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // Consumer 재개
      socket.on('resumeConsumer', async (data, callback) => {
        try {
          await this.mediaController.handleResumeConsumer(socket, data)
          if (typeof callback === 'function') {
            callback({ success: true })
          }
        } catch (error) {
          logger.error('Resume consumer error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // 방 나가기
      socket.on('leaveRoom', (callback) => {
        try {
          this.roomController.handleLeaveRoom(socket)
          if (typeof callback === 'function') {
            callback({ success: true })
          }
        } catch (error) {
          logger.error('Leave room error:', error)
          if (typeof callback === 'function') {
            callback({ error: error.message })
          }
        }
      })

      // 연결 해제
      socket.on('disconnect', () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`)
        
        const peerInfo = this.roomManager.peers.get(socket.id)
        if (peerInfo) {
          // 다른 참가자들에게 알림
          socket.to(peerInfo.roomId).emit('peerLeft', {
            peerId: peerInfo.peerId,
            socketId: socket.id,
          })
        }
        
        // 방에서 제거
        this.roomManager.leaveRoom(socket.id)
      })

      // 에러 처리
      socket.on('error', (error) => {
        logger.error(`🚨 Socket error for ${socket.id}:`, error)
      })
    })

    logger.info('🎮 RTC Socket handlers initialized')
  }
}
