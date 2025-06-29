import { getRoomManager } from '../service/rtcService.mjs';
import * as logger from '../util/logger.mjs';

const roomMgr = getRoomManager();

// 상태 조회
export const status = (req, res) => {
  const stats = {
    status: 'OK',
    activeRooms: roomMgr.rooms?.size || 0,
    totalParticipants: roomMgr.rooms ? Array.from(roomMgr.rooms.values()).reduce((sum, room) => sum + room.size, 0) : 0,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    message: 'SUCCESS', 
    data: stats 
  });
};

// 세션 시작 (룸 생성)
export const startSession = (req, res) => {
  try {
    const { roomId, maxParticipants } = req.body;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
        data: null
      });
    }

    // 룸이 이미 존재하는지 확인
    if (roomMgr.rooms && roomMgr.rooms.has(roomId)) {
      return res.status(409).json({
        success: false,
        message: 'Room already exists',
        data: null
      });
    }

    logger.log(`Session start requested for room: ${roomId}`);
    
    res.json({ 
      success: true, 
      message: 'SUCCESS', 
      data: {
        roomId,
        maxParticipants: maxParticipants || 10,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// 세션 종료 (룸 삭제)
export const stopSession = (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required',
        data: null
      });
    }

    logger.log(`Session stop requested for room: ${roomId}`);
    
    // 실제 룸 정리는 마지막 참가자가 나갈 때 자동으로 처리됨
    res.json({ 
      success: true, 
      message: 'SUCCESS', 
      data: {
        roomId,
        stoppedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error stopping session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// 룸 목록 조회
export const getRooms = (req, res) => {
  try {
    const rooms = roomMgr.getAllRooms ? roomMgr.getAllRooms() : [];
    
    res.json({
      success: true,
      message: 'SUCCESS',
      data: rooms
    });
  } catch (error) {
    logger.error('Error getting rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

// 특정 룸 정보 조회
export const getRoomInfo = (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = roomMgr.getRoomInfo ? roomMgr.getRoomInfo(roomId) : null;
    
    if (!roomInfo) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'SUCCESS',
      data: roomInfo
    });
  } catch (error) {
    logger.error('Error getting room info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};
