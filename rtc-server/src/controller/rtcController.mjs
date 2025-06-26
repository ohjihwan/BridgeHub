import { createRoomInSpring } from '../service/springClient.mjs';
import { log, error } from '../util/logger.mjs';
import 'dotenv/config';

// 임시 토큰으로 테스트
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// 테스트 토큰 발행
export function issueTestToken(req, res) {
  try {
    const { userId = 'test-user' } = req.body;
    // payload: userId, roles
    const token = jwt.sign(
      { userId, roles: ['ROLE_USER'] },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    log('[TestToken] issued for', userId);
    res.json({ token });
  } catch (err) {
    error('[TestToken] error', err);
    res.status(500).json({ message: 'Token issuance failed' });
  }
}

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
  res.json({ user: req.user });
}
