import * as logger from '../util/logger.mjs';

export default class RoomManager {
  constructor(maxPeers = 10) {
    this.maxPeers = maxPeers;
    this.rooms = new Map();
    this.peers = new Map();
    this.roomData = new Map();
  }

  canJoin(roomId) {
    const set = this.rooms.get(roomId);
    const canJoin = !set || set.size < this.maxPeers;
    logger.debug(`Room ${roomId} capacity check: ${set?.size || 0}/${this.maxPeers} - ${canJoin ? 'allowed' : 'denied'}`);
    return canJoin;
  }

  join(roomId, socket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.roomData.set(roomId, {
        id: roomId,
        createdAt: new Date(),
        participants: new Map()
      });
      logger.log(`Created new room: ${roomId}`);
    }
    
    this.rooms.get(roomId).add(socket.id);
    socket.join(roomId);
    
    const roomData = this.roomData.get(roomId);
    roomData.participants.set(socket.id, {
      socketId: socket.id,
      user: socket.user,
      joinedAt: new Date()
    });
    
    logger.log(`User ${socket.user?.username || socket.id} joined room ${roomId} (${this.rooms.get(roomId).size} participants)`);
  }

  leave(roomId, socket) {
    const set = this.rooms.get(roomId);
    if (!set) return;
    
    set.delete(socket.id);
    socket.leave(roomId);
    
    const roomData = this.roomData.get(roomId);
    if (roomData) {
      roomData.participants.delete(socket.id);
    }
    
    if (this.peers.has(socket.id)) {
      const peer = this.peers.get(socket.id);
      peer.close();
      this.peers.delete(socket.id);
    }
    
    logger.log(`User ${socket.user?.username || socket.id} left room ${roomId} (${set.size} participants remaining)`);
    
    if (set.size === 0) {
      this.rooms.delete(roomId);
      this.roomData.delete(roomId);
      logger.log(`Deleted empty room: ${roomId}`);
    }
  }

  setPeer(socketId, peer) {
    this.peers.set(socketId, peer);
  }

  getPeer(socketId) {
    return this.peers.get(socketId);
  }

  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    const roomData = this.roomData.get(roomId);
    
    if (!room || !roomData) {
      return null;
    }

    return {
      id: roomId,
      participantCount: room.size,
      maxParticipants: this.maxPeers,
      participants: Array.from(roomData.participants.values()).map(p => ({
        socketId: p.socketId,
        username: p.user?.username || 'Anonymous',
        nickname: p.user?.nickname || 'Anonymous',
        authenticated: p.user?.authenticated || false,
        joinedAt: p.joinedAt,
      })),
      createdAt: roomData.createdAt,
    };
  }

  getAllRooms() {
    return Array.from(this.rooms.keys()).map(roomId => this.getRoomInfo(roomId));
  }

  getRoomParticipants(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  getUserRoom(socketId) {
    for (const [roomId, participants] of this.rooms.entries()) {
      if (participants.has(socketId)) {
        return roomId;
      }
    }
    return null;
  }
}
