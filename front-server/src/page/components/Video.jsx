import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"

const Video = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [currentView, setCurrentView] = useState("lobby") // 'lobby', 'room'
  const [nickname, setNickname] = useState("")
  const [roomName, setRoomName] = useState("")
  const [roomList, setRoomList] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [mediaState, setMediaState] = useState({ video: true, audio: true, screen: false })
  const [showRoomList, setShowRoomList] = useState(false)
  const [mediaError, setMediaError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState("checking")
  const [showRoomListInRoom, setShowRoomListInRoom] = useState(false) // 방 안에서도 방 목록 보기

  const socketRef = useRef(null)
  const myStreamRef = useRef(null)
  const myScreenStreamRef = useRef(null)
  const myVideoRef = useRef(null)
  const peerConnectionsRef = useRef(new Map())
  const peerVideosRef = useRef(new Map())

  // RTC 서버 주소 설정
  const RTC_SERVER_URL = process.env.REACT_APP_RTC_SERVER_URL || "http://192.168.0.58:7601"

  useEffect(() => {
    checkBrowserCompatibility()
    initializeSocket()
    return () => cleanup()
  }, [])

  // 주기적으로 방 목록 업데이트 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        getRoomList()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const checkBrowserCompatibility = async () => {
    console.log("🔍 Checking browser compatibility...")

    if (!navigator.mediaDevices) {
      console.error("❌ navigator.mediaDevices not supported")
      setMediaError("이 브라우저는 미디어 기능을 지원하지 않습니다. Chrome, Firefox, Safari 최신 버전을 사용해주세요.")
      return
    }

    if (!navigator.mediaDevices.getUserMedia) {
      console.error("❌ getUserMedia not supported")
      setMediaError("이 브라우저는 카메라/마이크 접근을 지원하지 않습니다.")
      return
    }

    const isSecure =
      location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1"
    if (!isSecure) {
      console.warn("⚠️ Not running on HTTPS, media access might be restricted")
    }

    try {
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: "camera" })
        const microphonePermission = await navigator.permissions.query({ name: "microphone" })

        console.log("📹 Camera permission:", cameraPermission.state)
        console.log("🎤 Microphone permission:", microphonePermission.state)

        if (cameraPermission.state === "granted" && microphonePermission.state === "granted") {
          setPermissionStatus("granted")
        } else if (cameraPermission.state === "denied" || microphonePermission.state === "denied") {
          setPermissionStatus("denied")
        } else {
          setPermissionStatus("prompt")
        }
      } else {
        setPermissionStatus("prompt")
      }
    } catch (error) {
      console.log("📋 Permission API not available, will prompt for access")
      setPermissionStatus("prompt")
    }

    console.log("✅ Browser compatibility check completed")
  }

  const initializeSocket = () => {
    try {
      socketRef.current = io(RTC_SERVER_URL, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      })

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to RTC server:", RTC_SERVER_URL)
        setIsConnected(true)
        setConnectionError(null)
        getRoomList()
      })

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Connection error:", error)
        setConnectionError(`서버 연결 실패: ${error.message}`)
        setIsConnected(false)
      })

      socketRef.current.on("disconnect", (reason) => {
        console.log("🔌 Disconnected:", reason)
        setIsConnected(false)
        if (reason === "io server disconnect") {
          socketRef.current.connect()
        }
      })

      socketRef.current.on("room-list", (rooms) => {
        console.log("📋 Room list received:", rooms.length, "rooms")
        console.log("📋 Rooms:", rooms)
        setRoomList(rooms)
      })

      socketRef.current.on("room-created", ({ roomId, roomName, participants }) => {
        console.log("🏠 Room created:", roomId, "with name:", roomName)
        setCurrentRoom({ id: roomId, name: roomName })
        setParticipants(participants)
        setCurrentView("room")

        // 방 생성 후 방 목록 즉시 업데이트
        setTimeout(() => {
          getRoomList()
          initializeMedia()
        }, 500)
      })

      socketRef.current.on("room-joined", ({ roomId, roomName, participants }) => {
        console.log("👤 Joined room:", roomId)
        setCurrentRoom({ id: roomId, name: roomName })
        setParticipants(participants)
        setCurrentView("room")

        // 방 참여 후 방 목록 업데이트
        setTimeout(() => {
          getRoomList()
          initializeMedia()
        }, 500)
      })

      socketRef.current.on("join-error", ({ message }) => {
        alert(`입장 실패: ${message}`)
      })

      socketRef.current.on("user-joined", ({ participant, participants }) => {
        console.log("👋 User joined:", participant.nickname)
        setParticipants(participants)
        addChatMessage("시스템", `${participant.nickname}님이 입장했습니다.`)

        // 방 목록 업데이트 (참여자 수 변경)
        getRoomList()

        setTimeout(() => {
          createPeerConnection(participant.id, participant.nickname, true)
        }, 1000)
      })

      socketRef.current.on("user-left", ({ participantId, nickname, participants }) => {
        console.log("👋 User left:", nickname)
        setParticipants(participants)
        addChatMessage("시스템", `${nickname}님이 방을 나갔습니다.`)

        // 방 목록 업데이트 (참여자 수 변경)
        getRoomList()

        const peerConnection = peerConnectionsRef.current.get(participantId)
        if (peerConnection) {
          peerConnection.close()
          peerConnectionsRef.current.delete(participantId)
        }

        peerVideosRef.current.delete(participantId)
      })

      socketRef.current.on("webrtc-signal", async ({ senderId, senderNickname, signal, type }) => {
        console.log(`📡 Received WebRTC signal: ${type} from ${senderNickname}`)

        let peerConnection = peerConnectionsRef.current.get(senderId)

        if (!peerConnection) {
          peerConnection = createPeerConnection(senderId, senderNickname, false)
        }

        try {
          if (type === "offer") {
            await peerConnection.setRemoteDescription(signal)
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            socketRef.current.emit("webrtc-signal", {
              targetId: senderId,
              signal: answer,
              type: "answer",
            })
          } else if (type === "answer") {
            await peerConnection.setRemoteDescription(signal)
          } else if (type === "ice-candidate") {
            await peerConnection.addIceCandidate(signal)
          }
        } catch (error) {
          console.error("WebRTC signal handling error:", error)
        }
      })

      socketRef.current.on("peer-media-state-changed", ({ peerId, nickname, video, audio, screen }) => {
        console.log(`🎥 ${nickname} media state:`, { video, audio, screen })
      })

      socketRef.current.on("chat-message", (chatData) => {
        addChatMessage(chatData.from, chatData.message, chatData.timestamp)
      })
    } catch (error) {
      console.error("Socket initialization error:", error)
      setConnectionError(`초기화 실패: ${error.message}`)
    }
  }

  const initializeMedia = async () => {
    console.log("🎥 Initializing media...")
    setMediaError(null)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("브라우저가 미디어 접근을 지원하지 않습니다.")
      }

      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }

      console.log("📹 Requesting media access with constraints:", constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      console.log("✅ Media access granted")
      console.log(
        "📊 Stream tracks:",
        stream.getTracks().map((track) => ({
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
        })),
      )

      myStreamRef.current = stream

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream
        console.log("📺 Video element connected to stream")
      }

      setPermissionStatus("granted")
      setMediaError(null)

      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      setMediaState({
        video: videoTrack ? videoTrack.enabled : false,
        audio: audioTrack ? audioTrack.enabled : false,
        screen: false,
      })

      console.log("🎉 Media initialization completed successfully")
    } catch (error) {
      console.error("❌ Media access error:", error)

      let errorMessage = "카메라/마이크 접근에 실패했습니다."

      if (error.name === "NotAllowedError") {
        errorMessage = "카메라/마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요."
        setPermissionStatus("denied")
      } else if (error.name === "NotFoundError") {
        errorMessage = "카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요."
      } else if (error.name === "NotReadableError") {
        errorMessage = "카메라/마이크가 다른 애플리케이션에서 사용 중입니다."
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "요청한 미디어 설정을 지원하지 않습니다."
      } else if (error.name === "SecurityError") {
        errorMessage = "보안상의 이유로 미디어 접근이 차단되었습니다. HTTPS 환경에서 실행해주세요."
      }

      setMediaError(errorMessage)

      if (error.name === "NotAllowedError") {
        showPermissionGuide()
      }
    }
  }

  const showPermissionGuide = () => {
    const guide = `
🔧 카메라/마이크 권한 허용 방법:

1. Chrome 주소창 왼쪽의 🔒 또는 🎥 아이콘 클릭
2. "카메라" 및 "마이크"를 "허용"으로 변경
3. 페이지 새로고침

또는 Chrome 설정:
1. chrome://settings/content/camera
2. chrome://settings/content/microphone
3. 사이트 추가: ${window.location.origin}

강제 권한 허용으로 Chrome 실행:
"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --use-fake-ui-for-media-stream --use-fake-device-for-media-stream --disable-web-security --allow-running-insecure-content ${window.location.href}
    `

    console.log(guide)
    alert("카메라/마이크 권한이 필요합니다. 콘솔을 확인하여 권한 허용 방법을 참고해주세요.")
  }

  const requestMediaPermission = async () => {
    console.log("🔄 Requesting media permission...")
    await initializeMedia()
  }

  const createPeerConnection = (peerId, peerNickname, shouldCreateOffer) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("webrtc-signal", {
          targetId: peerId,
          signal: event.candidate,
          type: "ice-candidate",
        })
      }
    }

    peerConnection.ontrack = (event) => {
      console.log(`🎬 Received track from ${peerNickname}`)
      peerVideosRef.current.set(peerId, {
        stream: event.streams[0],
        nickname: peerNickname,
      })
      setParticipants((prev) => [...prev])
    }

    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, myStreamRef.current)
      })
    }

    if (myScreenStreamRef.current) {
      myScreenStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, myScreenStreamRef.current)
      })
    }

    peerConnectionsRef.current.set(peerId, peerConnection)

    if (shouldCreateOffer) {
      setTimeout(async () => {
        try {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)

          socketRef.current.emit("webrtc-signal", {
            targetId: peerId,
            signal: offer,
            type: "offer",
          })
        } catch (error) {
          console.error("Create offer error:", error)
        }
      }, 500)
    }

    return peerConnection
  }

  const createRoom = () => {
    if (!nickname.trim() || !roomName.trim()) {
      alert("닉네임과 방 이름을 입력해주세요.")
      return
    }

    if (!socketRef.current || !socketRef.current.connected) {
      alert("서버에 연결되지 않았습니다.")
      return
    }

    console.log("🏠 Creating room:", roomName.trim(), "by:", nickname.trim())

    socketRef.current.emit("create-room", {
      roomName: roomName.trim(),
      nickname: nickname.trim(),
    })
  }

  const joinRoom = (roomId) => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.")
      return
    }

    if (!socketRef.current || !socketRef.current.connected) {
      alert("서버에 연결되지 않았습니다.")
      return
    }

    socketRef.current.emit("join-room", {
      roomId,
      nickname: nickname.trim(),
    })
  }

  const getRoomList = () => {
    if (socketRef.current && socketRef.current.connected) {
      console.log("📋 Requesting room list...")
      socketRef.current.emit("get-room-list")
    }
  }

  const toggleVideo = () => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        const newState = { ...mediaState, video: videoTrack.enabled }
        setMediaState(newState)
        notifyMediaStateChange(newState)
      }
    }
  }

  const toggleAudio = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        const newState = { ...mediaState, audio: audioTrack.enabled }
        setMediaState(newState)
        notifyMediaStateChange(newState)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!mediaState.screen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        myScreenStreamRef.current = screenStream

        peerConnectionsRef.current.forEach((peerConnection) => {
          screenStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, screenStream)
          })
        })

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare()
        }

        const newState = { ...mediaState, screen: true }
        setMediaState(newState)
        notifyMediaStateChange(newState)
      } else {
        stopScreenShare()
      }
    } catch (error) {
      console.error("Screen share error:", error)
      alert("화면 공유를 시작할 수 없습니다.")
    }
  }

  const stopScreenShare = () => {
    if (myScreenStreamRef.current) {
      myScreenStreamRef.current.getTracks().forEach((track) => track.stop())
      myScreenStreamRef.current = null
    }

    const newState = { ...mediaState, screen: false }
    setMediaState(newState)
    notifyMediaStateChange(newState)
  }

  const notifyMediaStateChange = (state) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("media-state-changed", state)
    }
  }

  const sendChat = () => {
    const message = chatInput.trim()
    if (!message) return

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat-message", { message })
      setChatInput("")
    }
  }

  const addChatMessage = (from, message, timestamp = null) => {
    const time = timestamp ? new Date(timestamp) : new Date()
    const timeString = time.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        from,
        message,
        time: timeString,
      },
    ])
  }

  const leaveRoom = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("leave-room")
    }

    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((track) => track.stop())
      myStreamRef.current = null
    }

    if (myScreenStreamRef.current) {
      myScreenStreamRef.current.getTracks().forEach((track) => track.stop())
      myScreenStreamRef.current = null
    }

    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()
    peerVideosRef.current.clear()

    setCurrentRoom(null)
    setParticipants([])
    setChatMessages([])
    setMediaState({ video: true, audio: true, screen: false })
    setCurrentView("lobby")
    setMediaError(null)
    setShowRoomListInRoom(false)

    // 로비로 돌아가면서 방 목록 업데이트
    setTimeout(() => {
      getRoomList()
    }, 500)
  }

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (myScreenStreamRef.current) {
      myScreenStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    peerConnectionsRef.current.forEach((pc) => pc.close())
  }

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      maxWidth: "1400px",
      margin: "0 auto",
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    title: {
      color: "#333",
      marginBottom: "10px",
      fontSize: "28px",
    },
    connectionStatus: {
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "10px",
      textAlign: "center",
      fontWeight: "bold",
    },
    connected: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    disconnected: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    mediaStatus: {
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "20px",
      textAlign: "center",
      fontWeight: "bold",
    },
    mediaGranted: {
      backgroundColor: "#d1ecf1",
      color: "#0c5460",
      border: "1px solid #bee5eb",
    },
    mediaDenied: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    mediaPrompt: {
      backgroundColor: "#fff3cd",
      color: "#856404",
      border: "1px solid #ffeaa7",
    },
    inputGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    input: {
      padding: "12px",
      border: "2px solid #ddd",
      borderRadius: "8px",
      fontSize: "16px",
      minWidth: "200px",
    },
    button: {
      padding: "12px 20px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
    },
    primaryButton: {
      backgroundColor: "#007bff",
      color: "white",
    },
    successButton: {
      backgroundColor: "#28a745",
      color: "white",
    },
    dangerButton: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    warningButton: {
      backgroundColor: "#ffc107",
      color: "#212529",
    },
    disabledButton: {
      backgroundColor: "#6c757d",
      color: "white",
      cursor: "not-allowed",
    },
    infoButton: {
      backgroundColor: "#17a2b8",
      color: "white",
    },
    roomListContainer: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "20px",
    },
    roomItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      border: "1px solid #eee",
      borderRadius: "8px",
      marginBottom: "10px",
      backgroundColor: "#f8f9fa",
    },
    currentRoomItem: {
      backgroundColor: "#e7f3ff",
      border: "2px solid #007bff",
    },
    roomInfo: {
      flex: 1,
    },
    roomName: {
      fontWeight: "bold",
      fontSize: "18px",
      marginBottom: "5px",
    },
    roomDetails: {
      color: "#666",
      fontSize: "14px",
    },
    videoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    videoContainer: {
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "15px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    video: {
      width: "100%",
      height: "200px",
      backgroundColor: "#000",
      borderRadius: "8px",
      objectFit: "cover",
    },
    videoLabel: {
      marginTop: "10px",
      fontWeight: "bold",
      color: "#333",
    },
    controlPanel: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      flexWrap: "wrap",
      marginBottom: "20px",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    participantsList: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "20px",
    },
    participantItem: {
      padding: "10px",
      borderBottom: "1px solid #eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chatContainer: {
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "20px",
    },
    chatBox: {
      height: "200px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "15px",
      overflowY: "auto",
      marginBottom: "15px",
      backgroundColor: "#f8f9fa",
    },
    chatInputContainer: {
      display: "flex",
      gap: "10px",
    },
    chatInput: {
      flex: 1,
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "16px",
    },
    errorContainer: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
      borderRadius: "5px",
      padding: "15px",
      marginBottom: "20px",
    },
  }

  // 연결 상태 표시
  const renderConnectionStatus = () => (
    <div
      style={{
        ...styles.connectionStatus,
        ...(isConnected ? styles.connected : styles.disconnected),
      }}
    >
      {isConnected
        ? `✅ RTC 서버 연결됨 (${RTC_SERVER_URL})`
        : `❌ RTC 서버 연결 실패 ${connectionError ? `- ${connectionError}` : ""}`}
    </div>
  )

  // 미디어 상태 표시
  const renderMediaStatus = () => {
    let statusStyle, statusText

    if (permissionStatus === "granted") {
      statusStyle = styles.mediaGranted
      statusText = "🎥 카메라/마이크 권한 허용됨"
    } else if (permissionStatus === "denied") {
      statusStyle = styles.mediaDenied
      statusText = "❌ 카메라/마이크 권한 거부됨"
    } else if (permissionStatus === "prompt") {
      statusStyle = styles.mediaPrompt
      statusText = "⏳ 카메라/마이크 권한 요청 중"
    } else {
      statusStyle = styles.mediaPrompt
      statusText = "🔍 브라우저 호환성 확인 중"
    }

    return <div style={{ ...styles.connectionStatus, ...statusStyle }}>{statusText}</div>
  }

  // 방 목록 렌더링 (로비와 방 안에서 공통 사용)
  const renderRoomList = () => (
    <div style={styles.roomListContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3>참여 가능한 방 목록 ({roomList.length}개)</h3>
        <button style={{ ...styles.button, ...styles.infoButton }} onClick={getRoomList} disabled={!isConnected}>
          🔄 새로고침
        </button>
      </div>

      {roomList.length === 0 ? (
        <p>현재 생성된 방이 없습니다.</p>
      ) : (
        roomList.map((room) => {
          const isCurrentRoom = currentRoom && room.id === currentRoom.id
          return (
            <div
              key={room.id}
              style={{
                ...styles.roomItem,
                ...(isCurrentRoom ? styles.currentRoomItem : {}),
              }}
            >
              <div style={styles.roomInfo}>
                <div style={styles.roomName}>
                  {room.name} {isCurrentRoom && "(현재 방)"}
                </div>
                <div style={styles.roomDetails}>
                  참여자: {room.participantCount}/{room.maxParticipants} | 생성시간:{" "}
                  {new Date(room.createdAt).toLocaleString("ko-KR")}
                </div>
              </div>
              {!isCurrentRoom && (
                <button
                  style={{
                    ...styles.button,
                    ...(room.participantCount >= room.maxParticipants || !isConnected
                      ? styles.disabledButton
                      : styles.successButton),
                  }}
                  onClick={() => joinRoom(room.id)}
                  disabled={room.participantCount >= room.maxParticipants || !isConnected}
                >
                  {room.participantCount >= room.maxParticipants ? "가득참" : "입장"}
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )

  if (currentView === "lobby") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>WebRTC P2P 화상회의</h1>
          {renderConnectionStatus()}
          {renderMediaStatus()}

          {mediaError && (
            <div style={styles.errorContainer}>
              <strong>미디어 오류:</strong> {mediaError}
              <br />
              <button
                style={{ ...styles.button, ...styles.warningButton, marginTop: "10px" }}
                onClick={requestMediaPermission}
              >
                🔄 권한 재요청
              </button>
            </div>
          )}

          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="방 이름 입력"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button
              style={{
                ...styles.button,
                ...(isConnected ? styles.primaryButton : styles.disabledButton),
              }}
              onClick={createRoom}
              disabled={!isConnected}
            >
              방 만들기
            </button>
            <button
              style={{
                ...styles.button,
                ...(isConnected ? styles.successButton : styles.disabledButton),
              }}
              onClick={() => {
                setShowRoomList(!showRoomList)
                if (!showRoomList && isConnected) getRoomList()
              }}
              disabled={!isConnected}
            >
              방 목록 {showRoomList ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {showRoomList && renderRoomList()}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>방: {currentRoom?.name}</h1>
        <p>닉네임: {nickname}</p>
        {renderConnectionStatus()}
        {renderMediaStatus()}

        {mediaError && (
          <div style={styles.errorContainer}>
            <strong>미디어 오류:</strong> {mediaError}
            <br />
            <button
              style={{ ...styles.button, ...styles.warningButton, marginTop: "10px" }}
              onClick={requestMediaPermission}
            >
              🔄 권한 재요청
            </button>
          </div>
        )}
      </div>

      <div style={styles.controlPanel}>
        <button
          style={{ ...styles.button, ...(mediaState.video ? styles.dangerButton : styles.successButton) }}
          onClick={toggleVideo}
          disabled={!myStreamRef.current}
        >
          비디오 {mediaState.video ? "OFF" : "ON"}
        </button>
        <button
          style={{ ...styles.button, ...(mediaState.audio ? styles.dangerButton : styles.successButton) }}
          onClick={toggleAudio}
          disabled={!myStreamRef.current}
        >
          오디오 {mediaState.audio ? "OFF" : "ON"}
        </button>
        <button
          style={{ ...styles.button, ...(mediaState.screen ? styles.dangerButton : styles.warningButton) }}
          onClick={toggleScreenShare}
        >
          화면공유 {mediaState.screen ? "OFF" : "ON"}
        </button>
        <button
          style={{ ...styles.button, ...styles.infoButton }}
          onClick={() => {
            setShowRoomListInRoom(!showRoomListInRoom)
            if (!showRoomListInRoom) getRoomList()
          }}
        >
          방 목록 {showRoomListInRoom ? "숨기기" : "보기"}
        </button>
        <button style={{ ...styles.button, ...styles.dangerButton }} onClick={leaveRoom}>
          방 나가기
        </button>
      </div>

      {/* 방 안에서도 방 목록 보기 */}
      {showRoomListInRoom && renderRoomList()}

      <div style={styles.videoGrid}>
        <div style={styles.videoContainer}>
          <video ref={myVideoRef} style={styles.video} autoPlay playsInline muted />
          <div style={styles.videoLabel}>나 ({nickname})</div>
        </div>

        {Array.from(peerVideosRef.current.entries()).map(([peerId, peerData]) => (
          <div key={peerId} style={styles.videoContainer}>
            <video
              style={styles.video}
              autoPlay
              playsInline
              ref={(videoElement) => {
                if (videoElement && peerData.stream) {
                  videoElement.srcObject = peerData.stream
                }
              }}
            />
            <div style={styles.videoLabel}>{peerData.nickname}</div>
          </div>
        ))}
      </div>

      <div style={styles.participantsList}>
        <h3>참여자 목록 ({participants.length}/10)</h3>
        {participants.map((participant) => (
          <div key={participant.id} style={styles.participantItem}>
            <span>
              {participant.nickname}
              {participant.isHost && " (방장)"}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.chatContainer}>
        <h3>채팅</h3>
        <div style={styles.chatBox}>
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              [{msg.time}] {msg.from}: {msg.message}
            </div>
          ))}
        </div>
        <div style={styles.chatInputContainer}>
          <input
            style={styles.chatInput}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendChat()}
            placeholder="메시지를 입력하세요..."
          />
          <button style={{ ...styles.button, ...styles.primaryButton }} onClick={sendChat}>
            전송
          </button>
        </div>
      </div>
    </div>
  )
}

export default Video
