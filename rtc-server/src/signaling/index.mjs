import { MEDIASOUP_OPTIONS } from '../config/index.mjs';
import { log } from '../utils/logger.mjs';
import { getRoomManager } from '../services/rtcService.mjs';
import mediasoup from 'mediasoup';

export default async function bindSignaling(io) {
  // 1) 워커 생성 (shared)
  const worker = await mediasoup.createWorker(MEDIASOUP_OPTIONS.worker);
  worker.appData = { router: MEDIASOUP_OPTIONS.router };

  // 2) RoomManager 준비
  const roomMgr = getRoomManager();

  io.on('connection', socket => {
    log('[RTC] connected', socket.id);

    socket.on('joinRoom', async ({ roomId }) => {
      if (!roomMgr.canJoin(roomId)) return socket.emit('error', '방이 가득 찼습니다');
      const { router } = await roomMgr.joinRoom(worker, roomId, socket);
      socket.emit('routerRtpCapabilities', router.rtpCapabilities);
    });

    socket.on('createTransport', async () => {
      const peer = roomMgr.getPeer(socket.id);
      const transport = await peer.createWebRtcTransport(MEDIASOUP_OPTIONS.webRtcTransport);
      socket.emit('transportCreated', {
        id:             transport.id,
        iceParameters:  transport.iceParameters,
        dtlsParameters: transport.dtlsParameters
      });
    });

    socket.on('connectTransport', async ({ transportId, dtlsParameters }) => {
      const peer = roomMgr.getPeer(socket.id);
      await peer.connectTransport(transportId, dtlsParameters);
      socket.emit('transportConnected');
    });

    socket.on('produce', async (data) => {
      const peer     = roomMgr.getPeer(socket.id);
      const producer = await peer.produce(data);
      socket.to(peer.roomId).emit('newProducer', { producerId: producer.id, socketId: socket.id, kind: data.kind });
      socket.emit('produced', { producerId: producer.id });
    });

    socket.on('consume', async ({ producerId, rtpCapabilities }) => {
      const peer = roomMgr.getPeer(socket.id);
      if (!peer.canConsume(producerId, rtpCapabilities)) return socket.emit('error', 'Cannot consume');
      const consumer = await peer.consume({ producerId, rtpCapabilities });
      socket.emit('consumed', {
        producerId,
        id:            consumer.id,
        kind:          consumer.kind,
        rtpParameters: consumer.rtpParameters
      });
    });

    socket.on('disconnect', () => {
      roomMgr.leave(socket.id);
      log('[RTC] disconnected', socket.id);
    });
  });
}
