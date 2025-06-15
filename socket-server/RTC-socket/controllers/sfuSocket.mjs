import { initRouter, createWebRtcTransport } from '../sfu/mediasoupServer.mjs';
import { getOrCreateRoom, addPeerToRoom, removePeerFromRoom, getPeersInRoom, getRoom, deleteRoom } from '../models/room.mjs';

const MAX_PEERS = 10;

export default function handleSfuSocket(io) {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let peerId = socket.id;

    socket.on('sfu/join-room', async ({ roomId }, callback) => {
      currentRoomId = roomId;
      let room = await getOrCreateRoom(roomId, initRouter);

      // 최대 인원 체크
      const peers = getPeersInRoom(roomId);
      if (peers.length >= MAX_PEERS) {
        callback && callback({ success: false, error: '방이 가득 찼습니다.' });
        return;
      }

      addPeerToRoom(roomId, peerId, { socketId: peerId, producers: [], consumers: [] });
      socket.join(roomId);

      const otherPeers = getPeersInRoom(roomId).filter(id => id !== peerId);

      socket.to(roomId).emit('sfu/new-peer', { peerId });
      socket.emit('sfu/existing-peers', { peerIds: otherPeers });
      socket.emit('sfu/rtp-capabilities', room.router.rtpCapabilities);

      callback && callback({ success: true, peers: otherPeers, rtpCapabilities: room.router.rtpCapabilities });
    });

    socket.on('disconnect', () => {
      if (currentRoomId) {
        removePeerFromRoom(currentRoomId, peerId);
        socket.to(currentRoomId).emit('sfu/peer-disconnected', { peerId });

        // 인원 없으면 클린업
        if (getPeersInRoom(currentRoomId).length === 0) {
          deleteRoom(currentRoomId);
        }
      }
    });
  });
}
