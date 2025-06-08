import dotenv from 'dotenv';
import http from 'http';
import app from './app.mjs';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ WebRTC server running on http://localhost:${PORT}`);
});