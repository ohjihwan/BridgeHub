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
    
    // 주기적으로 API 서버 헬스체크
    this.startHealthCheck();
  }

  async canJoin(roomId, user) {
    const room = this.rooms.get(roomId);
    const currentSize = room ? room.size : 0;
    
    // 기본 용량 체크
    if (currentSize >= MAX_PEERS_PER_ROOM) {
      logger.debug(`Room ${roomId} is full: ${currentSize}/${MAX_PEERS_PER_ROOM}`);
      return { canJoin: false, reason: 'ROOM_FULL' };
    }

    // 인증된 사용자인 경우 스터디룸 멤버십 확인
    if (user?.authenticated && user?.id) {
      try {
        // 스터디룸 정보 확인
        const studyRoomInfo = await springClient.getStudyRoomInfo(roomId);
        if (studyRoomInfo) {
          // 스터디룸 멤버인지 확인
          const isMember = await springClient.isStudyRoomMember(roomId, user.id);
          if (!isMember) {
            logger.debug(`User ${user.id} is not a member of study room ${roomId}`);
            return { canJoin: false, reason: 'NOT_MEMBER' };
          }
        } else {
          // 채팅방 정보 확인
          const chatRoomInfo = await springClient.getChatRoomInfo(roomId);
          if (chatRoomInfo && !chatRoomInfo.isActive) {
            logger.debug(`Chat room ${roomId} is not active`);
            return { canJoin: false, reason: 'ROOM_INACTIVE' };
          }
        }
      } catch (error) {
        logger.debug(`Could not verify room membership: ${error.message}`);
        // API 오류는 무시하고 계속 진행 (개발 환경)
        if (process.env.NODE_ENV !== 'development') {
          return { canJoin: false, reason: 'VERIFICATION_FAILED' };
        }
      }
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
        roomType: 'unknown', // 'study' or 'chat'
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
    
    // 방 타입 확인 및 설정
    if (user?.authenticated) {
      try {
        const studyRoomInfo = await springClient.getStudyRoomInfo(roomId);
        if (studyRoomInfo) {
          roomData.roomType = 'study';
          roomData.studyRoomInfo = studyRoomInfo;
        } else {
          const chatRoomInfo = await springClient.getChatRoomInfo(roomId);
          if (chatRoomInfo) {
            roomData.roomType = 'chat';
            roomData.chatRoomInfo = chatRoomInfo;
          }
        }
      } catch (error) {
        logger.debug(`Could not determine room type: ${error.message}`);
      }
    }
    
    logger.log(`User ${user?.username || socket.id} joined room ${roomId} (${this.rooms.get(roomId).size} participants)`);
    
    return {
      roomId,
      participants: Array.from(roomData.participants.values()),
      participantCount: this.rooms.get(roomId).size,
      roomType: roomData.roomType,
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
      roomType: roomData.roomType,
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

  // 채팅 메시지 저장
  async saveChatMessage(roomId, senderId, content, messageType = 'TEXT') {
    try {
      const success = await springClient.saveMessage({
        roomId: parseInt(roomId),
        senderId: senderId,
        content: content,
        messageType: messageType
      });
      
      if (success) {
        logger.debug(`Chat message saved for room ${roomId}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Failed to save chat message: ${error.message}`);
      return false;
    }
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
        logger.debug('Server stats reported');
      } catch (error) {
        logger.debug(`Failed to report server stats: ${error.message}`);
      }
    }, 5 * 60 * 1000); // 5분
  }

  // API 서버 헬스체크
  startHealthCheck() {
    // 1분마다 API 서버 헬스체크
    setInterval(async () => {
      try {
        const isHealthy = await springClient.healthCheck();
        if (!isHealthy) {
          logger.warn('API server health check failed');
        }
      } catch (error) {
        logger.debug(`Health check error: ${error.message}`);
      }
    }, 60 * 1000); // 1분
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
