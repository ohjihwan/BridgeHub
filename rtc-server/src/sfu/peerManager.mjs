import { logger } from '../util/logger.mjs'

export class PeerManager {
  constructor() {
    this.peers = new Map() // socketId -> peerInfo
    this.rooms = new Map() // roomId -> Set of peerIds
  }

  addPeer(socketId, roomId, peerId, transport) {
    const peerInfo = {
      socketId,
      roomId,
      peerId,
      transport,
      producer: null,
      consumers: new Map(),
      isHost: false,
      joinedAt: new Date(),
    }

    this.peers.set(socketId, peerInfo)

    // 방에 피어 추가
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId).add(peerId)

    // 첫 번째 참가자는 호스트로 설정 (일대다에서 송신자)
    if (this.rooms.get(roomId).size === 1) {
      peerInfo.isHost = true
      logger.info(`👑 Peer ${peerId} is now the host of room ${roomId}`)
    }

    logger.info(`➕ Peer added: ${peerId} to room ${roomId}`)
    return peerInfo
  }

  removePeer(socketId) {
    const peerInfo = this.peers.get(socketId)
    if (!peerInfo) return null

    const { roomId, peerId } = peerInfo

    // Transport 정리
    if (peerInfo.transport) {
      peerInfo.transport.close()
    }

    // Producer 정리
    if (peerInfo.producer) {
      peerInfo.producer.close()
    }

    // Consumer 정리
    peerInfo.consumers.forEach(consumer => consumer.close())

    // 피어 제거
    this.peers.delete(socketId)

    // 방에서 피어 제거
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(peerId)
      
      // 빈 방 정리
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId)
      }
    }

    logger.info(`➖ Peer removed: ${peerId} from room ${roomId}`)
    return peerInfo
  }

  getPeer(socketId) {
    return this.peers.get(socketId)
  }

  getRoomPeers(roomId) {
    const peerIds = this.rooms.get(roomId)
    if (!peerIds) return []

    const peers = []
    for (const [socketId, peerInfo] of this.peers) {
      if (peerInfo.roomId === roomId) {
        peers.push(peerInfo)
      }
    }
    return peers
  }

  getHostPeer(roomId) {
    const peers = this.getRoomPeers(roomId)
    return peers.find(peer => peer.isHost) || null
  }

  // 일대다 통신에서 호스트 변경
  changeHost(roomId, newHostPeerId) {
    const peers = this.getRoomPeers(roomId)
    
    // 기존 호스트 해제
    peers.forEach(peer => {
      peer.isHost = false
    })

    // 새 호스트 설정
    const newHost = peers.find(peer => peer.peerId === newHostPeerId)
    if (newHost) {
      newHost.isHost = true
      logger.info(`👑 Host changed to ${newHostPeerId} in room ${roomId}`)
      return true
    }

    return false
  }

  getRoomStats(roomId) {
    const peers = this.getRoomPeers(roomId)
    const host = this.getHostPeer(roomId)

    return {
      roomId,
      totalPeers: peers.length,
      hostPeer: host ? host.peerId : null,
      viewers: peers.filter(p => !p.isHost).length,
      hasActiveStream: host && host.producer !== null,
    }
  }
}

export const peerManager = new PeerManager()
