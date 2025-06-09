const activeRooms = new Map();

export function handleSocketConnection(socket, io) {
  socket.on('join-match', () => {
    let paired = false;

    for (const [roomId, users] of activeRooms.entries()) {
      if (users.length < 2) {
        users.push(socket.id);
        socket.join(roomId);
        socket.roomId = roomId;
        io.to(roomId).emit('matched', { roomId, users });
        paired = true;
        break;
      }
    }

    if (!paired) {
      const newRoom = `room-${socket.id}`;
      activeRooms.set(newRoom, [socket.id]);
      socket.join(newRoom);
      socket.roomId = newRoom;
    }
  });

  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('disconnect', () => {
    const room = socket.roomId;
    if (room && activeRooms.has(room)) {
      const users = activeRooms.get(room).filter(id => id !== socket.id);
      if (users.length === 0) {
        activeRooms.delete(room);
      } else {
        activeRooms.set(room, users);
      }
    }
  });
}
