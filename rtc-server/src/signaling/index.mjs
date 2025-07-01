import RoomManager from '../sfu/roomManager.mjs';
import jwt from 'jsonwebtoken';
import { getNicknameByUsername } from '../services/rtcService.mjs';

export const handleSocketEvents = (io, socket) => {
  // ✅ 방 생성
  socket.on('createRoom', ({ roomId }) => {
    if (!RoomManager.getRoom(roomId)) {
      RoomManager.createRoom(roomId);
      RoomManager.setHost(roomId, socket.id);
      console.log(`방 생성됨: ${roomId}`);
    }
    io.emit('roomList', getRoomSummaries());
  });

  // ✅ 방 목록 요청
  socket.on('getRoomList', () => {
    socket.emit('roomList', getRoomSummaries());
  });

  // ✅ 방 참가 및 인증
  socket.on('join', async ({ roomId, token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.sub;

      const nickname = await getNicknameByUsername(username);
      if (!nickname) {
        socket.emit('error', '닉네임을 찾을 수 없습니다.');
        return;
      }

      // 방이 없으면 생성
      if (!RoomManager.getRoom(roomId)) {
        RoomManager.createRoom(roomId);
        RoomManager.setHost(roomId, socket.id);
      }

      // 방 입장
      const success = RoomManager.joinRoom(roomId, socket, nickname);
      if (!success) {
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.nickname = nickname;

      const peers = RoomManager.getPeers(roomId);
      socket.emit('peer-list', peers);

      // 기존 유저에게 새 유저 입장 알림
      peers.forEach(({ id }) => {
        if (id !== socket.id) {
          const peerSocket = RoomManager.getSocketById(roomId, id);
          peerSocket?.emit('peer-joined', { id: socket.id, nickname });
        }
      });
    } catch (err) {
      console.error('소켓 join 인증 실패:', err.message);
      socket.emit('error', '인증 실패');
    }
  });

  // ✅ WebRTC signaling 메시지 중계
  socket.on('rtc-message', (msg) => {
    const { roomId, event, data } = JSON.parse(msg);
    socket.to(roomId).emit('rtc-message', JSON.stringify({
      event,
      data,
      from: socket.id,
    }));
  });

  // ✅ 채팅 메시지 중계
  socket.on('chat-message', (msg) => {
    const { roomId, ...rest } = JSON.parse(msg);
    io.to(roomId).emit('chat-message', JSON.stringify(rest));
  });

  // ✅ 퇴장 처리
  socket.on('disconnect', () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const hostId = RoomManager.getHost(roomId);
    RoomManager.leaveRoom(roomId, socket.id);

    if (socket.id === hostId) {
      RoomManager.deleteRoom(roomId);
    } else {
      const peers = RoomManager.getPeers(roomId);
      peers.forEach(({ id }) => {
        const peerSocket = RoomManager.getSocketById(roomId, id);
        peerSocket?.emit('peer-left', { id: socket.id });
      });
    }

    // 방 삭제 후 목록 갱신
    if (!RoomManager.getRoom(roomId)) {
      io.emit('roomList', getRoomSummaries());
    }
  });
};

// ✅ 유틸: 방 목록 요약
function getRoomSummaries() {
  return RoomManager.getRoomList().map(roomId => {
    const room = RoomManager.getRoom(roomId);
    const hostSocket = RoomManager.getSocketById(roomId, room?.host);
    const nickname = hostSocket?.data?.nickname || '익명';
    return { roomId, host: nickname };
  });
}
