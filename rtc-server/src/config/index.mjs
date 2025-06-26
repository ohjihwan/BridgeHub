import dotenv from 'dotenv';
dotenv.config();

export const RTC_PORT = parseInt(process.env.RTC_PORT, 10);

export const SSL_KEY_PATH  = process.env.SSL_KEY_PATH;
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

export const SPRING_BASE_URL = process.env.SPRING_BASE_URL;

// Mediasoup 설정
export const MEDIASOUP_OPTIONS = {
  worker: {
    rtcMinPort:  parseInt(process.env.MEDIASOUP_MIN_PORT, 10),
    rtcMaxPort:  parseInt(process.env.MEDIASOUP_MAX_PORT, 10),
    logLevel:    process.env.MEDIASOUP_LOG_LEVEL
  },
  router: {
    mediaCodecs: [
      { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
      { kind: 'video', mimeType: 'video/VP8', clockRate: 90000, parameters: {} }
    ]
  },
  webRtcTransport: {
    listenIps: [{ ip: process.env.LISTEN_IP, announcedIp: process.env.ANNOUNCED_IP }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true
  }
};

// TURN 자격증명 (클라이언트용)
export const TURN_URL             = process.env.TURN_URL;
export const TURN_USERNAME_PREFIX = process.env.TURN_USERNAME_PREFIX;
export const TURN_SECRET          = process.env.TURN_SECRET;
export const TURN_REALM           = process.env.TURN_REALM;
export const TURN_TTL             = parseInt(process.env.TURN_TTL, 10);

// 애플리케이션 전역 설정
export const MAX_PEERS_PER_ROOM = parseInt(process.env.MAX_PEERS_PER_ROOM, 10);
