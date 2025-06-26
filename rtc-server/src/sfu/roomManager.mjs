import Peer from './peer.mjs';

export default class RoomManager {
  constructor(maxPeers) {
    this.maxPeers = maxPeers;
    this.rooms    = new Map(); // roomId → { router, peers: Map<socketId, Peer> }
  }

  canJoin(roomId) {
    const room = this.rooms.get(roomId);
    return !room || room.peers.size < this.maxPeers;
  }

  async joinRoom(worker, roomId, socket) {
    let room = this.rooms.get(roomId);
    if (!room) {
      const router = await worker.createRouter({ mediaCodecs: worker.appData.router.mediaCodecs });
      room = { router, peers: new Map() };
      this.rooms.set(roomId, room);
    }
    const peer = new Peer(room.router, socket, roomId);
    room.peers.set(socket.id, peer);
    socket.join(roomId);
    return { router: room.router, peer };
  }

  getPeer(socketId) {
    for (const { peers } of this.rooms.values()) {
      if (peers.has(socketId)) return peers.get(socketId);
    }
  }

  leave(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.peers.delete(socketId)) {
        if (room.peers.size === 0) this.rooms.delete(roomId);
        break;
      }
    }
  }
}
