import { getRoomManager } from '../service/rtcService.mjs';
import * as logger from '../util/logger.mjs';

const roomMgr = getRoomManager();

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
