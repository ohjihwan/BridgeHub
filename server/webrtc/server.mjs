import app from './app.mjs';
import http from 'http';
import { Server } from 'socket.io';
import { handleSocketConnection } from './controllers/match.mjs';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  handleSocketConnection(socket, io);
});

const PORT = process.env.PORT || 7600;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
