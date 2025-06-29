import express from "express";
import { getRoomManager } from "./service/rtcService.mjs";
import * as logger from "./util/logger.mjs";

const router = express.Router();
const roomMgr = getRoomManager();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RTC Server",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    activeRooms: roomMgr.rooms.size,
    totalParticipants: Array.from(roomMgr.rooms.values()).reduce((sum, room) => sum + room.size, 0),
  });
});

// Get all rooms
router.get("/api/rooms", (req, res) => {
  try {
    const rooms = roomMgr.getAllRooms();
    res.json({
      success: true,
      data: rooms,
      total: rooms.length,
    });
  } catch (error) {
    logger.error("Error getting rooms:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get specific room info
router.get("/api/rooms/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = roomMgr.getRoomInfo(roomId);
    
    if (!roomInfo) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: roomInfo,
    });
  } catch (error) {
    logger.error("Error getting room info:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Check if user can join room
router.post("/api/rooms/:roomId/can-join", (req, res) => {
  try {
    const { roomId } = req.params;
    const canJoin = roomMgr.canJoin(roomId);
    
    res.json({
      success: true,
      canJoin,
      roomId,
      currentParticipants: roomMgr.rooms.get(roomId)?.size || 0,
      maxParticipants: parseInt(process.env.MAX_PEERS_PER_ROOM) || 10,
    });
  } catch (error) {
    logger.error("Error checking room capacity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get server statistics
router.get("/api/stats", (req, res) => {
  try {
    const stats = {
      activeRooms: roomMgr.rooms.size,
      totalParticipants: Array.from(roomMgr.rooms.values()).reduce((sum, room) => sum + room.size, 0),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error getting server stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
