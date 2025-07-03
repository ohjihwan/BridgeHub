const express = require("express")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

const PORT = 7600
const maxClientsPerRoom = 4 // 4명으로 제한
const roomMaxDuration = 2 * 60 * 60 * 1000 // 2시간

// 방 정보 상세 관리
const rooms = new Map()

// 방 정보 구조
class Room {
  constructor(roomId, creatorNickname) {
    this.id = roomId
    this.createdAt = Date.now()
    this.creatorNickname = creatorNickname
    this.participants = new Map() // socketId -> userInfo
    this.isActive = true
    this.chatHistory = []
  }

  addParticipant(socketId, nickname) {
    this.participants.set(socketId, {
      socketId,
      nickname,
      joinedAt: Date.now(),
      isOnline: true,
    })
  }

  removeParticipant(socketId) {
    this.participants.delete(socketId)
  }

  getParticipantCount() {
    return this.participants.size
  }

  getParticipantList() {
    return Array.from(this.participants.values()).map((p) => ({
      socketId: p.socketId,
      nickname: p.nickname,
      joinedAt: p.joinedAt,
      isOnline: p.isOnline,
    }))
  }

  getRemainingTime() {
    const elapsed = Date.now() - this.createdAt
    return Math.max(0, roomMaxDuration - elapsed)
  }

  isExpired() {
    return this.getRemainingTime() <= 0
  }

  addChatMessage(from, message) {
    this.chatHistory.push({
      from,
      message,
      timestamp: Date.now(),
    })

    // 최대 100개 메시지만 보관
    if (this.chatHistory.length > 100) {
      this.chatHistory = this.chatHistory.slice(-100)
    }
  }
}

app.use(express.static(path.join(__dirname, "public")))

// 방 정리 함수
function cleanupExpiredRooms() {
  for (const [roomId, room] of rooms.entries()) {
    if (room.isExpired() || room.getParticipantCount() === 0) {
      console.log(`🧹 방 정리: ${roomId} (만료: ${room.isExpired()}, 참여자: ${room.getParticipantCount()})`)
      rooms.delete(roomId)
      io.emit("room-list", getRoomList())
    }
  }
}

// 활성 방 목록 생성
function getRoomList() {
  return Array.from(rooms.values())
    .filter((room) => room.isActive && !room.isExpired())
    .map((room) => ({
      id: room.id,
      createdAt: room.createdAt,
      participantCount: room.getParticipantCount(),
      maxParticipants: maxClientsPerRoom,
      remainingTime: room.getRemainingTime(),
      creatorNickname: room.creatorNickname,
    }))
}

// 5분마다 방 정리
setInterval(cleanupExpiredRooms, 5 * 60 * 1000)

io.on("connection", (socket) => {
  console.log(`🔌 새 연결: ${socket.id}`)

  // 방 생성
  socket.on("create-room", (roomId) => {
    if (!rooms.has(roomId)) {
      const room = new Room(roomId, "방장")
      rooms.set(roomId, room)
      console.log(`🏠 방 생성: ${roomId}`)
    }

    io.emit("room-list", getRoomList())
  })

  // 방 입장 - 다중 사용자 지원 강화
  socket.on("join", ({ roomId, nickname }) => {
    try {
      let room = rooms.get(roomId)

      // 방이 없으면 생성
      if (!room) {
        room = new Room(roomId, nickname)
        rooms.set(roomId, room)
        console.log(`🏠 방 자동 생성: ${roomId} by ${nickname}`)
      }

      // 방 만료 체크
      if (room.isExpired()) {
        socket.emit("room-expired", roomId)
        return
      }

      // 인원 제한 체크 (4명으로 제한)
      if (room.getParticipantCount() >= maxClientsPerRoom) {
        socket.emit("room-full", roomId)
        return
      }

      // 사용자 정보 저장
      socket.nickname = nickname
      socket.roomId = roomId

      // 방에 참여자 추가
      room.addParticipant(socket.id, nickname)
      socket.join(roomId)

      console.log(`🟢 ${nickname}(${socket.id}) 입장: ${roomId} (${room.getParticipantCount()}/${maxClientsPerRoom})`)

      // 기존 참여자들에게 새 사용자 입장 알림 (소켓 ID 포함)
      const joinData = {
        nickname,
        socketId: socket.id,
      }
      console.log(`📢 입장 알림 전송:`, joinData)
      socket.to(roomId).emit("user-joined", joinData)

      // 새 사용자에게 현재 참여자 목록 전송 (나를 제외한)
      const currentParticipants = room.getParticipantList().filter((p) => p.socketId !== socket.id)
      console.log(`👥 현재 참여자 목록 전송:`, currentParticipants)
      socket.emit("current-participants", currentParticipants)

      // 방 정보 전송 (타이머 동기화용)
      socket.emit("room-info", {
        roomId,
        createdAt: room.createdAt,
        remainingTime: room.getRemainingTime(),
        participantCount: room.getParticipantCount(),
        participants: room.getParticipantList(),
      })

      // 채팅 히스토리 전송 (최근 20개)
      const recentChats = room.chatHistory.slice(-20)
      if (recentChats.length > 0) {
        socket.emit("chat-history", recentChats)
      }

      // 방 목록 업데이트
      io.emit("room-list", getRoomList())
    } catch (error) {
      console.error(`❌ 입장 오류: ${error.message}`)
      socket.emit("join-error", error.message)
    }
  })

  // 미디어 준비 완료 알림
  socket.on("media-ready", ({ roomId }) => {
    console.log(`📹 미디어 준비 완료: ${socket.nickname}(${socket.id})`)
    socket.to(roomId).emit("user-media-ready", {
      nickname: socket.nickname,
      socketId: socket.id,
    })
  })

  // 방 목록 요청
  socket.on("get-room-list", () => {
    socket.emit("room-list", getRoomList())
  })

  // 방 상세 정보 요청
  socket.on("get-room-info", (roomId) => {
    const room = rooms.get(roomId)
    if (room) {
      socket.emit("room-info", {
        roomId,
        createdAt: room.createdAt,
        remainingTime: room.getRemainingTime(),
        participantCount: room.getParticipantCount(),
        participants: room.getParticipantList(),
        creatorNickname: room.creatorNickname,
      })
    }
  })

  // WebRTC 시그널링 - 1:1 메시지 전달 지원
  socket.on("rtc-message", (data) => {
    try {
      const { from, to, type, payload } = data

      console.log(`📡 RTC 시그널링: ${type} from ${from} to ${to}`)

      // 특정 사용자에게만 전달
      if (to) {
        socket.to(to).emit("rtc-message", {
          from: socket.id,
          to,
          type,
          payload,
        })
      } else {
        // 구버전 호환성을 위해 방 전체에 브로드캐스트
        socket.to(socket.roomId).emit("rtc-message", data)
      }
    } catch (error) {
      console.error(`❌ RTC 메시지 오류: ${error.message}`)
    }
  })

  // 채팅 메시지
  socket.on("chat-message", (data) => {
    try {
      const parsed = JSON.parse(data)
      const { roomId, from, message, timestamp } = parsed

      const room = rooms.get(roomId)
      if (room) {
        // 채팅 히스토리에 저장
        room.addChatMessage(from, message)

        // 다른 참여자들에게 전송
        socket.to(roomId).emit(
          "chat-message",
          JSON.stringify({
            from,
            message,
            timestamp,
          }),
        )
      }
    } catch (error) {
      console.error(`❌ 채팅 메시지 오류: ${error.message}`)
    }
  })

  // 사용자 상태 업데이트 (카메라/마이크)
  socket.on("user-status", ({ roomId, status }) => {
    socket.to(roomId).emit("user-status-update", {
      nickname: socket.nickname,
      socketId: socket.id,
      status,
    })
  })

  // 화면 공유 상태
  socket.on("screen-share-status", ({ roomId, isSharing }) => {
    socket.to(roomId).emit("screen-share-update", {
      nickname: socket.nickname,
      socketId: socket.id,
      isSharing,
    })
  })

  // 연결 해제 처리
  socket.on("disconnecting", () => {
    const rooms_to_leave = Array.from(socket.rooms).filter((r) => r !== socket.id)

    rooms_to_leave.forEach((roomId) => {
      const room = rooms.get(roomId)
      if (room) {
        room.removeParticipant(socket.id)

        console.log(
          `🔴 ${socket.nickname || "Unknown"}(${socket.id}) 퇴장: ${roomId} (${room.getParticipantCount()}/${maxClientsPerRoom})`,
        )

        // 퇴장 알림 (소켓 ID 포함)
        if (socket.nickname) {
          socket.to(roomId).emit("user-left", {
            nickname: socket.nickname,
            socketId: socket.id,
          })
        }

        // 빈 방 정리
        if (room.getParticipantCount() === 0) {
          console.log(`🗑️ 빈 방 삭제: ${roomId}`)
          rooms.delete(roomId)
        }
      }
    })

    // 방 목록 업데이트
    io.emit("room-list", getRoomList())
  })

  // 연결 해제
  socket.on("disconnect", () => {
    console.log(`🔌 연결 해제: ${socket.id}`)
  })

  // 핑-퐁 (연결 상태 체크)
  socket.on("ping", () => {
    socket.emit("pong")
  })
})

// 서버 상태 API
app.get("/api/status", (req, res) => {
  res.json({
    activeRooms: rooms.size,
    totalParticipants: Array.from(rooms.values()).reduce((sum, room) => sum + room.getParticipantCount(), 0),
    uptime: process.uptime(),
    maxParticipants: maxClientsPerRoom,
    rooms: getRoomList(),
  })
})

// 방 강제 종료 API (관리자용)
app.delete("/api/rooms/:roomId", (req, res) => {
  const roomId = req.params.roomId
  const room = rooms.get(roomId)

  if (room) {
    // 모든 참여자에게 강제 종료 알림
    io.to(roomId).emit("room-force-closed", { reason: "관리자에 의해 종료됨" })
    rooms.delete(roomId)
    io.emit("room-list", getRoomList())
    res.json({ success: true, message: `방 ${roomId}이 종료되었습니다.` })
  } else {
    res.status(404).json({ success: false, message: "방을 찾을 수 없습니다." })
  }
})

server.listen(PORT, () => {
  console.log(`🚀 WebRTC 서버 실행: http://localhost:${PORT}`)
  console.log(`📊 서버 상태: http://localhost:${PORT}/api/status`)
  console.log(`⚙️  최대 참여자: ${maxClientsPerRoom}명`)
  console.log(`⏰ 방 최대 시간: ${roomMaxDuration / (60 * 1000)}분`)
})
