import express from "express";
import { getRoomManager } from "../service/rtcService.mjs";
import { status, startSession, stopSession, getRooms, getRoomInfo } from "../controller/rtcController.mjs";
import * as logger from "../util/logger.mjs";

const router = express.Router();
const roomMgr = getRoomManager();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RTC Server",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    activeRooms: roomMgr.rooms?.size || 0,
    totalParticipants: roomMgr.rooms ? Array.from(roomMgr.rooms.values()).reduce((sum, room) => sum + room.size, 0) : 0,
  });
});

router.get("/status", status);
router.post("/session/start", startSession);
router.post("/session/stop", stopSession);

router.get("/api/rooms", getRooms);
router.get("/api/rooms/:roomId", getRoomInfo);

router.get("/api/stats", (req, res) => {
  try {
    const stats = {
      activeRooms: roomMgr.rooms?.size || 0,
      totalParticipants: roomMgr.rooms ? Array.from(roomMgr.rooms.values()).reduce((sum, room) => sum + room.size, 0) : 0,
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
