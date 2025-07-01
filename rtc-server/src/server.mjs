import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Socket.IO CORS 설정 - 프론트엔드 서버 허용
const io = new Server(server, { 
  cors: { 
    origin: [
      "http://localhost:3000",    // React 개발 서버
      "http://localhost:7000",    // 사용자 프론트 서버
      "http://192.168.0.58:7000", // 네트워크 접근
      "http://192.168.0.58:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  } 
});

const PORT = 7600;
const MAX_PARTICIPANTS = 10;

// 방 정보 저장
const rooms = new Map();

// Express CORS 미들웨어
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// 정적 파일 제공 (필요시)
app.use(express.static(path.join(__dirname, '../public')));

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: PORT, 
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// 방 목록 REST API (선택사항)
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    participantCount: room.participants.length,
    maxParticipants: room.maxParticipants,
    createdAt: room.createdAt
  }));
  res.json(roomList);
});

io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id, 'from:', socket.handshake.address);

  // 방 생성
  socket.on('create-room', ({ roomName, nickname }) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const roomInfo = {
      id: roomId,
      name: roomName,
      participants: [{
        id: socket.id,
        nickname: nickname,
        isHost: true
      }],
      createdAt: new Date(),
      maxParticipants: MAX_PARTICIPANTS
    };

    rooms.set(roomId, roomInfo);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.nickname = nickname;
    socket.isHost = true;

    console.log(`🏠 Room created: ${roomId} by ${nickname}`);

    socket.emit('room-created', {
      roomId,
      roomName,
      participants: roomInfo.participants
    });

    broadcastRoomList();
  });

  // 방 목록 요청
  socket.on('get-room-list', () => {
    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt
    }));

    socket.emit('room-list', roomList);
  });

  // 방 참여
  socket.on('join-room', ({ roomId, nickname }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('join-error', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.participants.length >= MAX_PARTICIPANTS) {
      socket.emit('join-error', { message: '방이 가득 찼습니다.' });
      return;
    }

    if (socket.roomId) {
      leaveCurrentRoom(socket);
    }

    const participant = {
      id: socket.id,
      nickname: nickname,
      isHost: false
    };

    room.participants.push(participant);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.nickname = nickname;
    socket.isHost = false;

    console.log(`👤 ${nickname} joined room ${roomId}`);

    socket.emit('room-joined', {
      roomId,
      roomName: room.name,
      participants: room.participants
    });

    socket.to(roomId).emit('user-joined', {
      participant: participant,
      participants: room.participants
    });

    broadcastRoomList();
  });

  // WebRTC 시그널링
  socket.on('webrtc-signal', ({ targetId, signal, type }) => {
    console.log(`📡 WebRTC signal: ${type} from ${socket.id} to ${targetId}`);
    
    socket.to(targetId).emit('webrtc-signal', {
      senderId: socket.id,
      senderNickname: socket.nickname,
      signal,
      type
    });
  });

  // 미디어 상태 변경 알림
  socket.on('media-state-changed', ({ video, audio, screen }) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('peer-media-state-changed', {
        peerId: socket.id,
        nickname: socket.nickname,
        video,
        audio,
        screen
      });
    }
  });

  // 채팅 메시지
  socket.on('chat-message', ({ message }) => {
    if (socket.roomId && socket.nickname) {
      const chatData = {
        from: socket.nickname,
        message: message,
        timestamp: Date.now(),
        senderId: socket.id
      };

      io.to(socket.roomId).emit('chat-message', chatData);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    
    if (socket.roomId) {
      leaveCurrentRoom(socket);
    }
  });

  socket.on('leave-room', () => {
    leaveCurrentRoom(socket);
  });

  function leaveCurrentRoom(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== socket.id);

    socket.to(roomId).emit('user-left', {
      participantId: socket.id,
      nickname: socket.nickname,
      participants: room.participants
    });

    if (room.participants.length === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Room deleted: ${roomId}`);
    } else if (socket.isHost) {
      room.participants[0].isHost = true;
      socket.to(roomId).emit('host-changed', {
        newHostId: room.participants[0].id,
        participants: room.participants
      });
    }

    socket.leave(roomId);
    socket.roomId = null;
    socket.nickname = null;
    socket.isHost = false;

    broadcastRoomList();
  }

  function broadcastRoomList() {
    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt
    }));

    io.emit('room-list', roomList);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebRTC RTC Server running at http://0.0.0.0:${PORT}`);
  console.log(`🌐 CORS enabled for frontend servers`);
  console.log(`👥 Max participants per room: ${MAX_PARTICIPANTS}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
});
