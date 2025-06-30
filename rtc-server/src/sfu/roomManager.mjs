import mediasoup from 'mediasoup'
import { mediasoupConfig } from '../config/mediasoup.mjs'
import { logger } from '../util/logger.mjs'

class RoomManager {
  constructor() {
    this.worker = null
    this.router = null
    this.rooms = new Map()
    this.peers = new Map()
  }

  async initialize() {
    try {
      // Worker 생성
      this.worker = await mediasoup.createWorker({
        rtcMinPort: mediasoupConfig.worker.rtcMinPort,
        rtcMaxPort: mediasoupConfig.worker.rtcMaxPort,
        logLevel: mediasoupConfig.worker.logLevel,
        logTags: mediasoupConfig.worker.logTags,
      })

      this.worker.on('died', () => {
        logger.error('mediasoup Worker died, exiting in 2 seconds... [pid:%d]', this.worker.pid)
        setTimeout(() => process.exit(1), 2000)
      })

      // Router 생성
      this.router = await this.worker.createRouter({
        mediaCodecs: mediasoupConfig.router.mediaCodecs,
      })

      logger.info('🎬 mediasoup Worker and Router created successfully')
    } catch (error) {
      logger.error('❌ Failed to initialize mediasoup:', error)
      throw error
    }
  }

  async createRoom(roomId, maxPeers = 10) {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)
    }

    const room = {
      id: roomId,
      peers: new Map(),
      maxPeers,
      createdAt: new Date(),
    }

    this.rooms.set(roomId, room)
    logger.info(`🏠 Room created: ${roomId} (max peers: ${maxPeers})`)
    
    return room
  }

  async joinRoom(roomId, peerId, socketId) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new Error('Room not found')
    }

    if (room.peers.size >= room.maxPeers) {
      throw new Error('Room is full')
    }

    // WebRTC Transport 생성 (일대다 통신용)
    const transport = await this.router.createWebRtcTransport({
      listenIps: mediasoupConfig.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      maxIncomingBitrate: mediasoupConfig.webRtcTransport.maxIncomingBitrate,
      initialAvailableOutgoingBitrate: mediasoupConfig.webRtcTransport.initialAvailableOutgoingBitrate,
    })

    const peer = {
      id: peerId,
      socketId,
      transport,
      producer: null,
      consumers: new Map(),
      joinedAt: new Date(),
    }

    room.peers.set(peerId, peer)
    this.peers.set(socketId, { roomId, peerId })

    logger.info(`👤 Peer ${peerId} joined room ${roomId} (${room.peers.size}/${room.maxPeers})`)
    
    return {
      transport: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
      routerRtpCapabilities: this.router.rtpCapabilities,
    }
  }

  async createProducer(socketId, transportId, rtpParameters, kind) {
    const peerInfo = this.peers.get(socketId)
    if (!peerInfo) {
      throw new Error('Peer not found')
    }

    const room = this.rooms.get(peerInfo.roomId)
    const peer = room.peers.get(peerInfo.peerId)

    const producer = await peer.transport.produce({
      kind,
      rtpParameters,
    })

    peer.producer = producer
    
    // 다른 피어들에게 새 프로듀서 알림 (일대다 브로드캐스트)
    this.notifyNewProducer(peerInfo.roomId, peerInfo.peerId, producer.id)

    logger.info(`🎬 Producer created for peer ${peerInfo.peerId} in room ${peerInfo.roomId}`)
    
    return { id: producer.id }
  }

  async createConsumer(socketId, producerId) {
    const peerInfo = this.peers.get(socketId)
    if (!peerInfo) {
      throw new Error('Peer not found')
    }

    const room = this.rooms.get(peerInfo.roomId)
    const peer = room.peers.get(peerInfo.peerId)

    // 프로듀서 찾기 (일대다에서 다른 피어의 스트림 수신)
    let producer = null
    for (const [, otherPeer] of room.peers) {
      if (otherPeer.producer && otherPeer.producer.id === producerId) {
        producer = otherPeer.producer
        break
      }
    }

    if (!producer) {
      throw new Error('Producer not found')
    }

    const consumer = await peer.transport.consume({
      producerId: producer.id,
      rtpCapabilities: this.router.rtpCapabilities,
      paused: true,
    })

    peer.consumers.set(consumer.id, consumer)

    logger.info(`🍿 Consumer created for peer ${peerInfo.peerId}`)

    return {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    }
  }

  notifyNewProducer(roomId, producerPeerId, producerId) {
    // 실제 구현에서는 Socket.IO를 통해 다른 피어들에게 알림
    logger.info(`📡 Broadcasting new producer ${producerId} from peer ${producerPeerId} in room ${roomId}`)
  }

  leaveRoom(socketId) {
    const peerInfo = this.peers.get(socketId)
    if (!peerInfo) return

    const room = this.rooms.get(peerInfo.roomId)
    if (room) {
      const peer = room.peers.get(peerInfo.peerId)
      if (peer) {
        // Transport 정리
        peer.transport.close()
        room.peers.delete(peerInfo.peerId)
        
        // 빈 방 정리
        if (room.peers.size === 0) {
          this.rooms.delete(peerInfo.roomId)
          logger.info(`🗑️ Empty room deleted: ${peerInfo.roomId}`)
        }
      }
    }

    this.peers.delete(socketId)
    logger.info(`👋 Peer ${peerInfo.peerId} left room ${peerInfo.roomId}`)
  }

  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    return {
      id: room.id,
      peerCount: room.peers.size,
      maxPeers: room.maxPeers,
      peers: Array.from(room.peers.keys()),
      isOneToMany: true, // 일대다 통신 표시
    }
  }
}

export const roomManager = new RoomManager()
