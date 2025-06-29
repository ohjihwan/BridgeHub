import { MAX_PEERS_PER_ROOM } from "../config/index.mjs";
import { getSpringClient } from "./springClient.mjs";
import * as logger from "../util/logger.mjs";

const springClient = getSpringClient();

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userRooms = new Map();
    this.roomData = new Map();
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    
    this.startStatsReporting();
    this.startHealthCheck();
  }

  async canJoin(roomId, user) {
    const room = this.rooms.get(roomId);
    const currentSize = room ? room.size : 0;
    
    if (currentSize >= MAX_PEERS_PER_ROOM) {
      logger.debug(`Room ${roomId} is full: ${currentSize}/${MAX_PEERS_PER_ROOM}`);
      return { canJoin: false, reason: 'ROOM_FULL' };
    }

    if (user?.authenticated && user?.id) {
      try {
        const studyRoomInfo = await springClient.getStudyRoomInfo(roomId);
        if (studyRoomInfo) {
          const isMember = await springClient.isStudyRoomMember(roomId, user.id);
          if (!isMember) {
            logger.debug(`User ${user.id} is not a member of study room ${roomId}`);
            return { canJoin: false, reason: 'NOT_MEMBER' };
          }
        } else {
          const chatRoomInfo = await springClient.getChatRoomInfo(roomId);
          if (chatRoomInfo && !chatRoomInfo.isActive) {
            logger.debug(`Chat room ${roomId} is not active`);
            return { canJoin: false, reason: 'ROOM_INACTIVE' };
          }
        }
      } catch (error) {
        logger.debug(`Could not verify room membership: ${error.message}`);
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
    
    const currentRoom = this.userRooms.get(socket.id);
    if (currentRoom && currentRoom !== roomId) {
      await this.leave(currentRoom, socket);
    }

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.roomData.set(roomId, {
        id: roomId,
        createdAt: new Date(),
        participants: new Map(),
        roomType: 'unknown',
      });
      logger.log(`Created new room: ${roomId}`);
    }

    this.rooms.get(roomId).add(socket.id);
    this.userRooms.set(socket.id, roomId);
    
    const roomData = this.roomData.get(roomId);
    roomData.participants.set(socket.id, {
      socketId: socket.id,
      user: user,
      joinedAt: new Date(),
    });

    socket.join(roomId);
    
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

    room.delete(socket.id);
    this.userRooms.delete(socket.id);
    
    const roomData = this.roomData.get(roomId);
    if (roomData) {
      roomData.participants.delete(socket.id);
    }

    this.cleanupTransports(socket.id);
    
    socket.leave(roomId);

    logger.log(`User ${user?.username || socket.id} left room ${roomId} (${room.size} participants remaining)`);

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

    this.producers.delete(socketId);
    this.consumers.delete(socketId);
  }

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

  startStatsReporting() {
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
    }, 5 * 60 * 1000);
  }

  startHealthCheck() {
    setInterval(async () => {
      try {
        const isHealthy = await springClient.healthCheck();
        if (!isHealthy) {
          logger.warn('API server health check failed');
        }
      } catch (error) {
        logger.debug(`Health check error: ${error.message}`);
      }
    }, 60 * 1000);
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
