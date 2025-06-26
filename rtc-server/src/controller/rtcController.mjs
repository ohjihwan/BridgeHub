import { createRoomInSpring } from '../services/springClient.mjs';
import { log, error } from '../utils/logger.mjs';

export async function createRoom(req, res) {
  try {
    const { roomName } = req.body;
    const ownerId = req.user.userId;
    const room    = await createRoomInSpring({ roomName, ownerId });
    log('Created room', room.roomId, 'by', ownerId);
    res.json(room);
  } catch (e) {
    error('createRoom error', e);
    res.status(500).json({ message: 'Room creation failed' });
  }
}

export async function validateToken(req, res) {
  // jwtAuth 미들웨어로 이미 검증됨
  res.json({ user: req.user });
}
