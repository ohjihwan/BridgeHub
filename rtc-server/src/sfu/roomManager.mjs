export default class RoomManager {
  constructor(maxPeers) {
    this.maxPeers = maxPeers;
    this.rooms    = new Map(); // roomId → Set<socket.id>
  }

  canJoin(roomId) {
    const set = this.rooms.get(roomId);
    return !set || set.size < this.maxPeers;
  }

  join(roomId, socket) {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId).add(socket.id);
    socket.join(roomId);
  }

  leave(roomId, socket) {
    const set = this.rooms.get(roomId);
    if (!set) return;
    set.delete(socket.id);
    socket.leave(roomId);
    if (set.size === 0) this.rooms.delete(roomId);
  }
}