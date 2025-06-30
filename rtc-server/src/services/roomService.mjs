import { roomManager } from '../sfu/roomManager.mjs'
import { logger } from '../util/logger.mjs'

export class RoomService {
  constructor() {
    this.roomManager = roomManager
  }

  async createRoom(roomId, maxPeers = 10) {
    try {
      const room = await this.roomManager.createRoom(roomId, maxPeers)
      logger.info(`Room service: Created room ${roomId}`)
      return room
    } catch (error) {
      logger.error(`Room service: Failed to create room ${roomId}:`, error)
      throw error
    }
  }

  async joinRoom(roomId, peerId, socketId) {
    try {
      const result = await this.roomManager.joinRoom(roomId, peerId, socketId)
      logger.info(`Room service: Peer ${peerId} joined room ${roomId}`)
      return result
    } catch (error) {
      logger.error(`Room service: Failed to join room ${roomId}:`, error)
      throw error
    }
  }

  leaveRoom(socketId) {
    try {
      this.roomManager.leaveRoom(socketId)
      logger.info(`Room service: Peer left room via socket ${socketId}`)
    } catch (error) {
      logger.error(`Room service: Failed to leave room:`, error)
      throw error
    }
  }

  getRoomInfo(roomId) {
    return this.roomManager.getRoomInfo(roomId)
  }

  getAllRooms() {
    const rooms = []
    for (const [roomId, room] of this.roomManager.rooms) {
      rooms.push({
        id: roomId,
        peerCount: room.peers.size,
        maxPeers: room.maxPeers,
        createdAt: room.createdAt,
      })
    }
    return rooms
  }

  getRoomStats() {
    return {
      totalRooms: this.roomManager.rooms.size,
      totalPeers: this.roomManager.peers.size,
    }
  }
}
