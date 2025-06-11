import { getWorker } from "./workerInstance.mjs";
import { getTurnCredentials } from "../utils/ice.mjs"; // 동적 ICE 정보 분리
import { logger } from "../utils/logger.mjs"; // 선택: 실무용 로거

const rooms = new Map();

/**
 * [방 별 Router 초기화/재사용]
 */
export async function initRouter(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId);

  const worker = await getWorker();

  // 실무에선 mediaCodecs 환경변수로 뺄 수도 있음
  const mediaCodecs = [
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
    },
  ];

  const router = await worker.createRouter({ mediaCodecs });
  const room = { router };
  rooms.set(roomId, room);

  logger.info(`[Router] 방 생성: ${roomId}`);

  return room;
}

/**
 * [Router 반환]
 */
export function getRouter(roomId) {
  return rooms.get(roomId)?.router ?? null;
}

/**
 * [WebRTC Transport 생성]
 * 실배포: announcedIp/ICE 서버 동적 세팅, 환경변수 연동
 */
export async function createWebRtcTransport(peerId, direction) {
  const worker = await getWorker();

  // 동적으로 coturn ICE 정보 받아오기
  const { urls, username, credential } = await getTurnCredentials();

  const listenIps = [
    {
      ip: process.env.LISTEN_IP || "0.0.0.0",
      announcedIp: process.env.ANNOUNCED_IP || "실제 퍼블릭IP", // EC2 환경에서 세팅
    },
  ];

  let transport;
  try {
    transport = await worker.createWebRtcTransport({
      listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: false,
      iceServers: [
        {
          urls, // stun/turn url array
          username,
          credential,
        },
      ],
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