import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import router from './router.mjs';
import socketAuth from './util/authMiddleware.mjs';
import config, { RTC_PORT, MAX_PEERS_PER_ROOM } from './config/index.mjs';
import RoomManager from './sfu/roomManager.mjs';

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, config.serverOptions);

app.use(router);
io.use(socketAuth);

const roomMgr = new RoomManager(MAX_PEERS_PER_ROOM);

io.on('connection', socket => {
  socket.on('join-room', ({ roomId, nickname }) => {
    if (!roomMgr.canJoin(roomId)) {
      return socket.emit('join-error', { code: 'ROOM_FULL' });
    }
    roomMgr.join(roomId, socket);
    socket.to(roomId).emit('new-participant', { socketId: socket.id, nickname });
  });

  ['offer', 'answer', 'ice-candidate'].forEach(evt => {
    socket.on(evt, data => {
      io.to(data.to).emit(evt, { from: socket.id, ...data });
    });
  });

  socket.on('leave-room', ({ roomId }) => {
    roomMgr.leave(roomId, socket);
    socket.to(roomId).emit('participant-left', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    for (const [roomId] of roomMgr.rooms) {
      roomMgr.leave(roomId, socket);
    }
  });
});

server.listen(RTC_PORT, '0.0.0.0',() => {
  console.log(`RTC server listening on port ${RTC_PORT}`);
});
