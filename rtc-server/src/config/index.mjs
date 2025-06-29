import "dotenv/config";

const config = {
  serverOptions: {
    cors: {
      origin: [
        "http://localhost:7000",
        "http://localhost:7700", 
        "https://thebridgehub.org",
        "https://bridgehub.asia",
        process.env.REACT_APP_API_URL
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  },
  
  mediasoup: {
    worker: {
      rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT) || 40000,
      rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT) || 49999,
      logLevel: process.env.MEDIASOUP_LOG_LEVEL || "warn",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
      ],
    },
    
    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    },
    
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.LISTEN_IP || "0.0.0.0",
          announcedIp: process.env.ANNOUNCED_IP || "127.0.0.1",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000,
    },
  },
  
  turn: {
    iceServers: [
      {
        urls: `stun:${process.env.STUN_HOST || 'stun.l.google.com'}:${process.env.STUN_PORT || 19302}`,
      },
      ...(process.env.TURN_HOST ? [{
        urls: `turn:${process.env.TURN_HOST}:${process.env.TURN_PORT || 3478}`,
        username: process.env.TURN_USER || 'bridgehub',
        credential: process.env.TURN_SECRET || 'bridgehub_secret_123',
      }] : []),
    ],
  },
};

export const RTC_PORT = parseInt(process.env.RTC_PORT) || 7600;
export const API_URL = process.env.API_URL || "http://localhost:7100";
export const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
export const MAX_PEERS_PER_ROOM = parseInt(process.env.MAX_PEERS_PER_ROOM) || 10;

export default config;