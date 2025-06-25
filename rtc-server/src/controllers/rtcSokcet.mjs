const activeRooms = new Map();
const MAX_USERS = 10; // 방 당 최대 인원

export function handleSocketConnection(socket, io) {
  socket.on('join-match', (roomId) => {
    // roomId를 클라이언트가 직접 지정하거나, 서버에서 랜덤 생성 가능
    let users = activeRooms.get(roomId) || [];

    if (users.length >= MAX_USERS) {
      socket.emit('room-full', { roomId });
      return;
    }

    users.push(socket.id);
    activeRooms.set(roomId, users);
    socket.join(roomId);
    socket.roomId = roomId;

    io.to(roomId).emit('matched', { roomId, users });
  });

  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('disconnect', () => {
    const room = socket.roomId;
    if (room && activeRooms.has(room)) {
      let users = activeRooms.get(room).filter(id => id !== socket.id);
      if (users.length === 0) {
        activeRooms.delete(room);
      } else {
        activeRooms.set(room, users);
        // 방에 남은 사람에게 사용자 목록 갱신 전송
        io.to(room).emit('matched', { roomId: room, users });
      }
    }
  });
}

