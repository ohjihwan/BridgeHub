const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 7600;
const maxClientsPerRoom = 10;
const roomCounts = {};
const activeRooms = new Set();

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("create-room", (roomId) => {
    activeRooms.add(roomId);
    io.emit("room-list", Array.from(activeRooms));
  });

  socket.on("join", ({ roomId, nickname }) => {
    socket.nickname = nickname;
    socket.roomId = roomId;

    if (!roomCounts[roomId]) {
      roomCounts[roomId] = 1;
    } else if (roomCounts[roomId] < maxClientsPerRoom) {
      roomCounts[roomId]++;
    } else {
      socket.emit("room-full", roomId);
      return;
    }

    socket.join(roomId);
    console.log(`🟢 ${nickname} joined room ${roomId}`);

    // 입장 안내 메시지 전송
    socket.to(roomId).emit(
      "chat-message",
      JSON.stringify({
        from: "시스템",
        message: `${nickname}님이 입장했습니다.`,
        timestamp: Date.now(),
      })
    );
  });

   socket.on("get-room-list", () => {
    socket.emit("room-list", Array.from(activeRooms));
  });

  socket.on("rtc-message", (data) => {
    const parsed = JSON.parse(data);
    const room = parsed.roomId;
    socket.to(room).emit("rtc-message", data);
  });

  socket.on("chat-message", (data) => {
    const parsed = JSON.parse(data);
    const { roomId, from, message, timestamp } = parsed;
    socket
      .to(roomId)
      .emit("chat-message", JSON.stringify({ from, message, timestamp }));
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      roomCounts[roomId]--;
      if (roomCounts[roomId] <= 0) {
        delete roomCounts[roomId];
        activeRooms.delete(roomId);
      }
      io.emit("room-list", Array.from(activeRooms));
      socket.to(roomId).emit("peer-left", { roomId });
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
