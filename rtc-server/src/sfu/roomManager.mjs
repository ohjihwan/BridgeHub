import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

class RoomManager {
  constructor() {
    this.rooms = new Map(); // { roomId: { peers: Map<socketId, { socket, nickname }>, createdAt, host, maxPeers } }
  }

  // 방 생성: 이미 있으면 false, 새로 만들면 true
  createRoom(roomId) {
    if (this.rooms.has(roomId)) return false;

    this.rooms.set(roomId, {
      peers: new Map(),
      createdAt: new Date(),
      maxPeers: parseInt(process.env.MAX_PEERS || 10),
      host: null
    });
    return true;
  }

  // 방에 소켓 입장 (닉네임 등록)
  joinRoom(roomId, socket, nickname) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.peers.size >= room.maxPeers) return false;

    room.peers.set(socket.id, { socket, nickname });
    return true;
  }

  // 방에서 소켓 퇴장
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.peers.delete(socketId);
      if (room.peers.size === 0) {
        this.rooms.delete(roomId); // 자동 삭제
      }
    }
  }

  // 명시적 방 삭제 (방장이 직접 요청하는 경우)
  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }

  // 연결된 peer 목록 반환 (id + nickname)
  getPeers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.peers.entries()).map(([id, { nickname }]) => ({ id, nickname }));
  }

  // 소켓 ID로 소켓 객체 가져오기
  getSocketById(roomId, socketId) {
    const room = this.rooms.get(roomId);
    return room?.peers.get(socketId)?.socket || null;
  }

  // 닉네임만 반환
  getNicknames(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.peers.values()).map(p => p.nickname) : [];
  }

  // 방 정보 가져오기
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // 호스트 지정
  setHost(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) room.host = socketId;
  }

  // 호스트 가져오기
  getHost(roomId) {
    return this.rooms.get(roomId)?.host;
  }

  // 방 목록 전체 반환 (roomId만)
  getRoomList() {
    return Array.from(this.rooms.keys());
  }
}

export default new RoomManager();
