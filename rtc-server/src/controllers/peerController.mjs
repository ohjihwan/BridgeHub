import { logger } from '../util/logger.mjs'
import { PeerService } from '../services/peerService.mjs'

export class PeerController {
  constructor(roomManager) {
    this.roomManager = roomManager
    this.peerService = new PeerService()
  }

  async handleConnectTransport(socket, data) {
    const { transportId, dtlsParameters } = data
    const peerInfo = this.roomManager.peers.get(socket.id)
    
    if (!peerInfo) {
      throw new Error('Peer not found')
    }

    const room = this.roomManager.rooms.get(peerInfo.roomId)
    const peer = room.peers.get(peerInfo.peerId)
    
    if (!peer || !peer.transport) {
      throw new Error('Transport not found')
    }

    // Transport 연결
    await peer.transport.connect({ dtlsParameters })
    
    logger.info(`🔗 Transport connected for peer ${peerInfo.peerId}`)
  }
}
