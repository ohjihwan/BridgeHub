import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handleSfuSocket from './controllers/sfuSocket.mjs';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

handleSfuSocket(io);

server.listen(7600, () => {
  console.log('Server running on http://localhost:7600');
});
