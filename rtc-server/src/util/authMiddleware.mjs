import { MAX_PEERS_PER_ROOM } from "../config/index.mjs";
import { getSpringClient } from "./springClient.mjs";
import * as logger from "../util/logger.mjs";

const springClient = getSpringClient();

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Set of socket IDs
    this.userRooms = new Map(); // socketId -> roomId
    this.roomData = new Map(); // roomId -> room metadata
    this.transports = new Map(); // socketId -> { send: transport, recv: transport }
    this.producers = new Map(); // socketId -> Map of producers
    this.consumers = new Map(); // socketId -> Map of consumers
    
    // 주기적으로 서버 상태를 API에 보고
    this.startStatsReporting();
  }

  async canJoin(roomId, user) {
    const room = this.rooms.get(roomId);
    const currentSize = room ? room.size : 0;
    
    // 기본 용량 체크
    if (currentSize >= MAX_PEERS_PER_ROOM) {
      logger.debug(`Room ${roomId} is full: ${currentSize}/${MAX_PEERS_PER_ROOM}`);
      return { canJoin: false, reason: 'ROOM_FULL' };
    }

    // Spring API를 통한 룸 정보 확인 (선택적)
    try {
      const roomInfo = await springClient.getRoomInfo(roomId);
      if (roomInfo && roomInfo.status === 'closed') {
        logger.debug(`Room ${roomId} is closed`);
        return { canJoin: false, reason: 'ROOM_CLOSED' };
      }
    } catch (error) {
      logger.debug(`Could not fetch room info from API: ${error.message}`);
      // API 오류는 무시하고 계속 진행
    }

    logger.debug(`Room ${roomId} capacity check: ${currentSize}/${MAX_PEERS_PER_ROOM} - allowed`);
    return { canJoin: true };
  }

  async join(roomId, socket) {
    const { user } = socket;
    
    // 이미 다른 방에 있다면 먼저 나가기
    const currentRoom = this.userRooms.get(socket.id);
    if (currentRoom && currentRoom !== roomId) {
      await this.leave(currentRoom, socket);
    }

    // 방이 없으면 생성
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.roomData.set(roomId, {
        id: roomId,
        createdAt: new Date(),
        participants: new Map(),
      });
      logger.log(`Created new room: ${roomId}`);
    }

    // 사용자를 방에 추가
    this.rooms.get(roomId).add(socket.id);
    this.userRooms.set(socket.id, roomId);
    
    // 방 데이터에 참가자 정보 추가
    const roomData = this.roomData.get(roomId);
    roomData.participants.set(socket.id, {
      socketId: socket.id,
      user: user,
      joinedAt: new Date(),
    });

    socket.join(roomId);
    
    // Spring API에 룸 참가 로그 전송
    if (user.authenticated) {
      try {
        await springClient.logRoomActivity(roomId, user.id, 'join');
      } catch (error) {
        logger.debug(`Failed to log room activity: ${error.message}`);
      }
    }
    
    logger.log(`User ${user?.username || socket.id} joined room ${roomId} (${this.rooms.get(roomId).size} participants)`);
    
    return {
      roomId,
      participants: Array.from(roomData.participants.values()),
      participantCount: this.rooms.get(roomId).size,
    };
  }

  async leave(roomId, socket) {
    const { user } = socket;
    const room = this.rooms.get(roomId);
    
    if (!room || !room.has(socket.id)) {
      return false;
    }

    // 방에서 사용자 제거
    room.delete(socket.id);
    this.userRooms.delete(socket.id);
    
    // 방 데이터에서 참가자 제거
    const roomData = this.roomData.get(roomId);
    if (roomData) {
      roomData.participants.delete(socket.id);
    }

    // 트랜스포트 정리
    this.cleanupTransports(socket.id);
    
    socket.leave(roomId);

    // Spring API에 룸 퇴장 로그 전송
    if (user?.authenticated) {
      try {
        await springClient.logRoomActivity(roomId, user.id, 'leave');
      } catch (error) {
        logger.debug(`Failed to log room activity: ${error.message}`);
      }
    }

    logger.log(`User ${user?.username || socket.id} left room ${roomId} (${room.size} participants remaining)`);

    // 방이 비어있으면 삭제
    if (room.size === 0) {
      this.rooms.delete(roomId);
      this.roomData.delete(roomId);
      logger.log(`Deleted empty room: ${roomId}`);
    }

    return true;
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
      maxParticipants: MAX_PEERS_PER_ROOM,
      participants: Array.from(roomData.participants.values()).map(p => ({
        socketId: p.socketId,
        username: p.user?.username || 'Anonymous',
        authenticated: p.user?.authenticated || false,
        joinedAt: p.joinedAt,
      })),
      createdAt: roomData.createdAt,
    };
  }

  getAllRooms() {
    return Array.from(this.rooms.keys()).map(roomId => this.getRoomInfo(roomId));
  }

  getUserRoom(socketId) {
    return this.userRooms.get(socketId);
  }

  // Transport 관리 메서드들 (기존과 동일)
  setTransport(socketId, type, transport) {
    if (!this.transports.has(socketId)) {
      this.transports.set(socketId, {});
    }
    this.transports.get(socketId)[type] = transport;
    logger.debug(`Set ${type} transport for ${socketId}`);
  }

  getTransport(socketId, type) {
    return this.transports.get(socketId)?.[type];
  }

  cleanupTransports(socketId) {
    const userTransports = this.transports.get(socketId);
    if (userTransports) {
      Object.values(userTransports).forEach(transport => {
        if (transport && typeof transport.close === 'function') {
          transport.close();
        }
      });
      this.transports.delete(socketId);
      logger.debug(`Cleaned up transports for ${socketId}`);
    }

    // Producer/Consumer 정리
    this.producers.delete(socketId);
    this.consumers.delete(socketId);
  }

  // Producer 관리 메서드들 (기존과 동일)
  addProducer(socketId, producer) {
    if (!this.producers.has(socketId)) {
      this.producers.set(socketId, new Map());
    }
    this.producers.get(socketId).set(producer.id, producer);
    logger.debug(`Added producer ${producer.id} for ${socketId}`);
  }

  removeProducer(socketId, producerId) {
    const userProducers = this.producers.get(socketId);
    if (userProducers) {
      userProducers.delete(producerId);
      logger.debug(`Removed producer ${producerId} for ${socketId}`);
    }
  }

  getProducers(socketId) {
    return this.producers.get(socketId) || new Map();
  }

  // Consumer 관리 메서드들 (기존과 동일)
  addConsumer(socketId, consumer) {
    if (!this.consumers.has(socketId)) {
      this.consumers.set(socketId, new Map());
    }
    this.consumers.get(socketId).set(consumer.id, consumer);
    logger.debug(`Added consumer ${consumer.id} for ${socketId}`);
  }

  removeConsumer(socketId, consumerId) {
    const userConsumers = this.consumers.get(socketId);
    if (userConsumers) {
      userConsumers.delete(consumerId);
      logger.debug(`Removed consumer ${consumerId} for ${socketId}`);
    }
  }

  getConsumers(socketId) {
    return this.consumers.get(socketId) || new Map();
  }

  // 서버 통계 보고
  startStatsReporting() {
    // 5분마다 서버 상태를 API에 보고
    setInterval(async () => {
      try {
        const stats = {
          activeRooms: this.rooms.size,
          totalParticipants: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.size, 0),
          authenticatedUsers: Array.from(this.roomData.values())
            .flatMap(room => Array.from(room.participants.values()))
            .filter(p => p.user?.authenticated).length,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        };

        await springClient.reportServerStats(stats);
        logger.debug('Server stats reported to API');
      } catch (error) {
        logger.debug(`Failed to report server stats: ${error.message}`);
      }
    }, 5 * 60 * 1000); // 5분
  }
}

let roomManager;

export function getRoomManager() {
  if (!roomManager) {
    roomManager = new RoomManager();
  }
  return roomManager;
}

export default RoomManager;
