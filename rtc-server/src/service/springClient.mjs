import axios from 'axios';
import { SPRING_BASE_URL } from '../config/index.mjs';

const client = axios.create({
  baseURL: SPRING_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// 예: 방 생성
export async function createRoomInSpring({ roomName, ownerId }) {
  const res = await client.post('/rtc/rooms', { roomName, ownerId });
  return res.data;  // { roomId, ... }
}

// 예: 사용자 토큰 검증
export async function validateUserToken(token) {
  const res = await client.get('/auth/validate', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;  // { userId, roles, ... }
}
