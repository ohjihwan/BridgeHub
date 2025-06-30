import { logger } from '../util/logger.mjs'
import { PeerService } from '../services/peerService.mjs'

export class MediaController {
  constructor(roomManager) {
    this.roomManager = roomManager
    this.peerService = new PeerService()
  }

  async handleProduce(socket, data) {
    const { kind, rtpParameters } = data
    const result = await this.peerService.createProducer(socket.id, rtpParameters, kind)
    
    logger.info(`🎬 Producer created: ${result.id} (${kind}) for socket ${socket.id}`)
    
    return result
  }

  async handleConsume(socket, data) {
    const { producerId } = data
    const result = await this.peerService.createConsumer(socket.id, producerId)
    
    logger.info(`🍿 Consumer created: ${result.id} for producer ${producerId}`)
    
    return result
  }

  async handleResumeConsumer(socket, data) {
    const { consumerId } = data
    const peerInfo = this.roomManager.peers.get(socket.id)
    
    if (!peerInfo) {
      throw new Error('Peer not found')
    }

    const room = this.roomManager.rooms.get(peerInfo.roomId)
    const peer = room.peers.get(peerInfo.peerId)
    const consumer = peer.consumers.get(consumerId)
    
    if (!consumer) {
      throw new Error('Consumer not found')
    }

    // Consumer 재개
    await consumer.resume()
    
    logger.info(`▶️ Consumer resumed: ${consumerId}`)
  }
}
