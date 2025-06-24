const MAX_USERS = 10;
const activeRooms = new Map();

export function handleSocketConnection(socket, io) {
  // 방 참가 요청
  socket.on("join-match", ({ roomId }) => {
    if (!roomId) return;
    let users = activeRooms.get(roomId) || [];
    if (users.length >= MAX_USERS) {
      socket.emit("matched", { roomId, users, error: "방이 가득 찼습니다." });
      return;
    }
    users.push(socket.id);
    activeRooms.set(roomId, users);
    socket.join(roomId);
    socket.roomId = roomId;
    // 모든 참가자에게 현재 인원 목록 전송
    io.to(roomId).emit("matched", { roomId, users });
  });

  // 신호 전달
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // 연결 종료 시 방에서 제거
  socket.on("disconnect", () => {
    const room = socket.roomId;
    if (room && activeRooms.has(room)) {
      let users = activeRooms.get(room).filter((id) => id !== socket.id);
      if (users.length === 0) {
        activeRooms.delete(room);
      } else {
        activeRooms.set(room, users);
        // 남은 인원에게 갱신된 목록 전송
        io.to(room).emit("matched", { roomId: room, users });
      }
    }
  });
}
