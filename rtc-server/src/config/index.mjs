import dotenv from 'dotenv';
dotenv.config();

export const RTC_PORT = parseInt(process.env.RTC_PORT, 10) || 7600;
export const MAX_PEERS_PER_ROOM = parseInt(process.env.MAX_PEERS_PER_ROOM, 10) || 10;

export default {
  serverOptions: {
    path: '/rtc',
    cors: { origin: '*' },
    transports: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 5000
  },
  iceServers: [
    { urls: `stun:${process.env.STUN_HOST}:${process.env.STUN_PORT}` },
    {
      urls: `turn:${process.env.TURN_HOST}:${process.env.TURN_PORT}`,
      username: process.env.TURN_USER,
      credential: process.env.TURN_SECRET
    }
  ]
};