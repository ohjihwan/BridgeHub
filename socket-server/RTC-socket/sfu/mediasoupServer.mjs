import { getWorker } from "./workerInstance.mjs";

const rooms = new Map();

export async function initRouter(roomId) {
  if (rooms.has(roomId)) return rooms.get(roomId);

  const worker = await getWorker();

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

  return room;
}

export function getRouter(roomId) {
  const room = rooms.get(roomId);
  return room?.router ?? null;
}

export async function createWebRtcTransport(peerId, direction) {
  const worker = await getWorker();

  const transport = await worker.createWebRtcTransport({
    listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    enableSctp: false,
    iceServers: [
      {
        urls: [
          'stun:54.252.32.250:3478',
          'turn:54.252.32.250:3478?transport=udp',
          'turn:54.252.32.250:3478?transport=tcp'
        ],
        username: 'your-username',
        credential: 'your-password'
      }
    ]
  });

  transport.appData = { peerId, direction };

  const params = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };

  return { transport, params };
}
