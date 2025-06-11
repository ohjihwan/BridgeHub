import { getWorker } from "./workerInstance.mjs";
import { generateTurnCredentials } from "../utils/ice.mjs";
import { logger } from "../utils/logger.mjs";
import dotenv from "dotenv";
dotenv.config();

const rooms = new Map();

export async function initRouter(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId);

  const worker = await getWorker();

  const mediaCodecs = [
    { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
    { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
  ];

  const router = await worker.createRouter({ mediaCodecs });
  const room = { router };
  rooms.set(roomId, room);

  logger.info(`[Router] 방 생성: ${roomId}`);
  return room;
}

export function getRouter(roomId) {
  return rooms.get(roomId)?.router ?? null;
}

export async function createWebRtcTransport(peerId, direction) {
  const worker = await getWorker();
  const { urls, username, credential } = generateTurnCredentials();

  const listenIps = [
    {
      ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
      announcedIp: process.env.ANNOUNCED_IP || process.env.TURN_URL.replace(/^turn:/, ""),
    }
  ];

  let transport;
  try {
    transport = await worker.createWebRtcTransport({
      listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: false,
      iceServers: [{ urls, username, credential }],
    });
    logger.info(`[Transport] Peer:${peerId}, 방향:${direction}, ID:${transport.id}`);
  } catch (err) {
    logger.error(`[Transport 생성 실패]`, err);
    throw err;
  }

  transport.appData = { peerId, direction };

  const params = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };

  return { transport, params };
}