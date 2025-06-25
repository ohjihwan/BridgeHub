import { initRouter, createWebRtcTransport } from '../sfu/mediasoupServer.mjs';
import { getOrCreateRoom, addPeerToRoom, removePeerFromRoom, getPeersInRoom } from '../models/room.mjs';

// SFU 시그널링 socket.io 이벤트 처리
export default function handleSfuSocket(io) {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let peerId = socket.id;

    // [1] 방 입장
    socket.on('sfu/join-room', async ({ roomId }) => {
      currentRoomId = roomId;

      // 방/Router 생성 or 재사용
      const room = await getOrCreateRoom(roomId, initRouter);

      // Peer를 방에 등록
      addPeerToRoom(roomId, peerId, { socketId: peerId, producers: [], consumers: [] });
      socket.join(roomId);

      // 기존 방에 있던 Peer IDs (본인 제외)
      const otherPeers = getPeersInRoom(roomId).filter(id => id !== peerId);

      // 1) 기존 Peer들에게 새 Peer 알림
      socket.to(roomId).emit('sfu/new-peer', { peerId });

      // 2) 새 Peer에게는 기존 Peer 목록 전달
      socket.emit('sfu/existing-peers', { peerIds: otherPeers });

      // 3) RTP capability 전달
      socket.emit('sfu/rtp-capabilities', room.router.rtpCapabilities);
    });

    // [2] 송신 트랜스포트 생성
    socket.on('sfu/create-send-transport', async (_, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport(peerId, 'send');
        // Peer 상태 저장(실무 확장 시 서비스/Map 등 활용)
        socket.sendTransport = transport;
        callback({ success: true, params });

        // DTLS 연결 처리
        socket.on('sfu/connect-send-transport', ({ dtlsParameters }) => {
          transport.connect({ dtlsParameters });
        });

        // Producer 생성
        socket.on('sfu/produce', async ({ kind, rtpParameters }, cb) => {
          try {
            const producer = await transport.produce({ kind, rtpParameters });
            // Peer에 producer 저장
            // PeerService/room.mjs에서 관리 가능
            cb({ id: producer.id });

            // 모든 방 참가자에게 "새 producer" 알림
            socket.to(currentRoomId).emit('sfu/new-producer', { producerId: producer.id, peerId });

            // 종료시 클린업
            producer.on('transportclose', () => producer.close());
          } catch (err) {
            cb({ error: err.message });
          }
        });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // [3] 수신 트랜스포트 생성
    socket.on('sfu/create-recv-transport', async (_, callback) => {
      try {
        const { transport, params } = await createWebRtcTransport(peerId, 'recv');
        socket.recvTransport = transport;

        socket.on('sfu/connect-recv-transport', ({ dtlsParameters }) => {
          transport.connect({ dtlsParameters });
        });

        callback({ success: true, params });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // [4] 미디어 consume (리모트 producer에 연결)
    socket.on('sfu/consume', async ({ producerId, rtpCapabilities }, callback) => {
      try {
        const room = await getOrCreateRoom(currentRoomId, initRouter);
        const router = room.router;

        if (!router.canConsume({ producerId, rtpCapabilities })) {
          throw new Error('수신 불가: canConsume=false');
        }

        const consumer = await socket.recvTransport.consume({
          producerId,
          rtpCapabilities,
          paused: false,
        });

        // 클라이언트에 consumer 정보 전달
        callback({
          success: true,
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

        // 종료시 클린업
        consumer.on('transportclose', () => consumer.close());
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // [5] Peer 퇴장/연결해제
    socket.on('disconnect', () => {
      if (currentRoomId) {
        removePeerFromRoom(currentRoomId, peerId);
        socket.to(currentRoomId).emit('sfu/peer-disconnected', { peerId });
      }
    });
  });
}
