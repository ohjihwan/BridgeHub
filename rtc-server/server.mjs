import express from 'express'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import { roomManager } from './src/sfu/roomManager.mjs'
import { RTCHandler } from './src/socket/rtcHandler.mjs'
import { logger } from './src/util/logger.mjs'
import { serverConfig } from './src/config/server.mjs'

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

class RTCServer {
  constructor() {
    this.app = express()
    this.server = null
    this.io = null
    this.rtcHandler = null
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing RTC Server...')
      
      // Express 미들웨어 설정
      this.setupMiddleware()
      
      // HTTP 서버 생성 (개발 환경에서는 HTTP 사용)
      this.createServer()
      
      // Socket.IO 설정
      this.setupSocketIO()
      
      // mediasoup 초기화
      logger.info('📡 Initializing mediasoup...')
      await roomManager.initialize()
      
      // RTC 핸들러 초기화
      this.rtcHandler = new RTCHandler(this.io, roomManager)
      
      // 라우트 설정
      this.setupRoutes()
      
      logger.info('✅ RTC Server initialized successfully')
    } catch (error) {
      logger.error('❌ Failed to initialize RTC Server:', error)
      throw error
    }
  }

  setupMiddleware() {
    // CORS 설정
    this.app.use(cors({
      origin: serverConfig.cors.origins,
      credentials: true,
    }))

    // JSON 파싱
    this.app.use(express.json())
    
    logger.info('🔧 Express middleware configured')
  }

  createServer() {
    // 개발 환경에서는 HTTP 서버 사용
    this.server = http.createServer(this.app)
    logger.info('🌐 HTTP server created')
  }

  setupSocketIO() {
    this.io = new Server(this.server, {
      cors: {
        origin: serverConfig.cors.origins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    logger.info('🔌 Socket.IO configured')
  }

  setupRoutes() {
    // 헬스 체크
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'RTC Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        mediasoup: {
          worker: !!roomManager.worker,
          router: !!roomManager.router,
        },
        stats: {
          rooms: roomManager.rooms.size,
          peers: roomManager.peers.size,
        },
      })
    })

    // 방 정보 조회
    this.app.get('/api/rooms/:roomId', (req, res) => {
      const { roomId } = req.params
      const roomInfo = roomManager.getRoomInfo(roomId)
      
      if (!roomInfo) {
        return res.status(404).json({ error: 'Room not found' })
      }
      
      res.json(roomInfo)
    })

    // 방 목록 조회
    this.app.get('/api/rooms', (req, res) => {
      const rooms = []
      for (const [roomId, room] of roomManager.rooms) {
        rooms.push({
          id: roomId,
          peerCount: room.peers.size,
          maxPeers: room.maxPeers,
          createdAt: room.createdAt,
        })
      }
      res.json({ rooms })
    })

    // 서버 상태 조회
    this.app.get('/api/status', (req, res) => {
      res.json({
        server: 'RTC Server',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        config: {
          port: serverConfig.port,
          localIp: serverConfig.network.localIp,
        },
        mediasoup: {
          worker: {
            pid: roomManager.worker?.pid,
            died: roomManager.worker?.died,
          },
          router: {
            id: roomManager.router?.id,
          },
        },
        rooms: Array.from(roomManager.rooms.values()).map(room => ({
          id: room.id,
          peerCount: room.peers.size,
          maxPeers: room.maxPeers,
          createdAt: room.createdAt,
        })),
      })
    })

    logger.info('🛣️ Routes configured')
  }

  start() {
    const port = serverConfig.port
    
    this.server.listen(port, () => {
      logger.info(`🎥 RTC Server running on http://localhost:${port}`)
      logger.info(`📊 Health check: http://localhost:${port}/health`)
      logger.info(`📈 Status: http://localhost:${port}/api/status`)
      logger.info(`🌐 Local IP: ${serverConfig.network.localIp}`)
    })

    // 에러 처리
    this.server.on('error', (error) => {
      logger.error('❌ Server error:', error)
    })

    // 정상 종료 처리
    process.on('SIGTERM', () => this.shutdown())
    process.on('SIGINT', () => this.shutdown())
  }

  shutdown() {
    logger.info('🛑 Shutting down RTC Server...')
    
    if (this.server) {
      this.server.close(() => {
        logger.info('✅ RTC Server closed')
        process.exit(0)
      })
    }
  }
}

// 서버 시작
async function startServer() {
  try {
    const rtcServer = new RTCServer()
    await rtcServer.initialize()
    rtcServer.start()
  } catch (error) {
    logger.error('💥 Failed to start RTC Server:', error)
    process.exit(1)
  }
}

startServer()
