import { roomManager } from '../sfu/roomManager.mjs'
import { logger } from '../util/logger.mjs'

export class PeerService {
  constructor() {
    this.roomManager = roomManager
  }

  async createProducer(socketId, rtpParameters, kind) {
    try {
      const result = await this.roomManager.createProducer(socketId, null, rtpParameters, kind)
      logger.info(`Peer service: Created producer for socket ${socketId}`)
      return result
    } catch (error) {
      logger.error(`Peer service: Failed to create producer:`, error)
      throw error
    }
  }

  async createConsumer(socketId, producerId) {
    try {
      const result = await this.roomManager.createConsumer(socketId, producerId)
      logger.info(`Peer service: Created consumer for socket ${socketId}`)
      return result
    } catch (error) {
      logger.error(`Peer service: Failed to create consumer:`, error)
      throw error
    }
  }

  getPeerInfo(socketId) {
    return this.roomManager.peers.get(socketId)
  }

  getPeersInRoom(roomId) {
    const room = this.roomManager.rooms.get(roomId)
    if (!room) return []

    const peers = []
    for (const [peerId, peer] of room.peers) {
      peers.push({
        id: peerId,
        socketId: peer.socketId,
        hasProducer: !!peer.producer,
        consumerCount: peer.consumers.size,
        joinedAt: peer.joinedAt,
      })
    }
    return peers
  }
}
