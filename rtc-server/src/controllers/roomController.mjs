import { logger } from '../util/logger.mjs'
import { RoomService } from '../services/roomService.mjs'

export class RoomController {
  constructor(roomManager) {
    this.roomManager = roomManager
    this.roomService = new RoomService()
  }

  async handleJoinRoom(socket, data) {
    const { roomId, peerId, rtpCapabilities } = data
    const socketId = socket.id

    logger.info(`🏠 Join room request: ${roomId} from ${peerId || socketId}`)

    // 방 생성 또는 조회
    await this.roomService.createRoom(roomId)
    
    // 방 참가
    const result = await this.roomService.joinRoom(roomId, peerId || socketId, socketId)
    
    // 소켓을 방에 추가
    socket.join(roomId)
    
    // 다른 참가자들에게 알림
    socket.to(roomId).emit('peerJoined', {
      peerId: peerId || socketId,
      socketId: socket.id,
    })

    logger.info(`✅ Peer ${peerId || socketId} joined room ${roomId}`)
    
    return {
      ...result,
      roomInfo: this.roomService.getRoomInfo(roomId),
    }
  }

  handleLeaveRoom(socket) {
    const peerInfo = this.roomManager.peers.get(socket.id)
    
    if (peerInfo) {
      const { roomId, peerId } = peerInfo
      
      // 소켓에서 방 나가기
      socket.leave(roomId)
      
      // 다른 참가자들에게 알림
      socket.to(roomId).emit('peerLeft', {
        peerId,
        socketId: socket.id,
      })
      
      logger.info(`👋 Peer ${peerId} left room ${roomId}`)
    }
    
    // roomManager에서 정리
    this.roomService.leaveRoom(socket.id)
  }
}
