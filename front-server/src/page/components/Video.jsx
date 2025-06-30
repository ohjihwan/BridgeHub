"use client"
import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import * as mediasoupClient from "mediasoup-client"

const Video = ({ onClose, userNickname, roomId }) => {
  const localVideoRef = useRef(null)
  const remoteVideosRef = useRef(new Map())
  const [device, setDevice] = useState(null)
  const [sendTransport, setSendTransport] = useState(null)
  const [socket, setSocket] = useState(null)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [screenShared, setScreenShared] = useState(false)
  const [producer, setProducer] = useState(null)
  const [consumers, setConsumers] = useState(new Map())
  const [participants, setParticipants] = useState([])
  const [localStream, setLocalStream] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("연결 중...")

  useEffect(() => {
    if (!roomId || !userNickname) return

    initializeRTC()

    return () => {
      cleanup()
    }
  }, [roomId, userNickname])

  const initializeRTC = async () => {
    try {
      setConnectionStatus("RTC 서버에 연결 중...")

      // RTC 소켓 연결
      const rtcSocket = io(`${process.env.NEXT_PUBLIC_RTC_SERVER_URL || "http://localhost:7600"}`, {
        auth: {
          token: localStorage.getItem("token") || "development-token",
        },
        transports: ["websocket", "polling"],
      })

      setSocket(rtcSocket)

      // 연결 성공
      rtcSocket.on("connect", async () => {
        console.log("🎥 RTC 서버 연결 성공")
        setIsConnected(true)
        setConnectionStatus("미디어 초기화 중...")

        try {
          // mediasoup device 초기화
          const dev = new mediasoupClient.Device()

          // Router RTP Capabilities 가져오기
          const { routerRtpCapabilities } = await socketRequest(rtcSocket, "getRouterRtpCapabilities")
          await dev.load({ routerRtpCapabilities })
          setDevice(dev)

          setConnectionStatus("방 참가 중...")

          // 방 참가 요청
          const result = await socketRequest(rtcSocket, "joinRoom", {
            roomId,
            peerId: userNickname,
            rtpCapabilities: dev.rtpCapabilities,
          })

          // Send transport 생성
          const transport = dev.createSendTransport(result.transport)
          setupTransportEvents(transport, rtcSocket)
          setSendTransport(transport)

          setConnectionStatus("카메라 시작 중...")

          // 로컬 미디어 시작
          await startCamera()

          setConnectionStatus("연결 완료")
          setTimeout(() => setConnectionStatus(""), 2000)
        } catch (error) {
          console.error("초기화 오류:", error)
          setConnectionStatus(`오류: ${error.message}`)
        }
      })

      // 연결 오류
      rtcSocket.on("connect_error", (err) => {
        console.error("RTC 연결 오류:", err)
        setConnectionStatus("RTC 서버 연결 실패")
      })

      // 새 참가자 입장
      rtcSocket.on("peerJoined", (participant) => {
        console.log("👤 새 참가자:", participant)
        setParticipants((prev) => [...prev, participant])
      })

      // 참가자 퇴장
      rtcSocket.on("peerLeft", ({ peerId, socketId }) => {
        console.log("👋 참가자 퇴장:", peerId)
        setParticipants((prev) => prev.filter((p) => p.peerId !== peerId))

        // 해당 참가자의 비디오 엘리먼트 제거
        const videoElement = remoteVideosRef.current.get(peerId)
        if (videoElement && videoElement.parentNode) {
          videoElement.parentNode.removeChild(videoElement)
          remoteVideosRef.current.delete(peerId)
        }
      })

      // 새 Producer 감지
      rtcSocket.on("newProducer", async ({ producerId, peerId }) => {
        console.log("🎬 새 producer:", { producerId, peerId })
        await handleConsume(rtcSocket, producerId, peerId)
      })
    } catch (error) {
      console.error("RTC 초기화 실패:", error)
      setConnectionStatus(`초기화 실패: ${error.message}`)
    }
  }

  const setupTransportEvents = (transport, socket) => {
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await socketRequest(socket, "connectTransport", {
          transportId: transport.id,
          dtlsParameters,
        })
        callback()
      } catch (error) {
        errback(error)
      }
    })

    transport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
      try {
        const { id } = await socketRequest(socket, "produce", {
          kind,
          rtpParameters,
        })
        callback({ id })
      } catch (error) {
        errback(error)
      }
    })
  }

  const startCamera = async () => {
    if (!sendTransport) {
      console.warn("Send transport가 준비되지 않음")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: audioOn,
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // 비디오 트랙 produce
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const prod = await sendTransport.produce({
          track: videoTrack,
        })
        setProducer(prod)
        console.log(`🎬 Video producer 생성:`, prod.id)
      }
    } catch (error) {
      console.error("카메라 시작 실패:", error)
      setConnectionStatus("카메라/마이크 접근 실패")
    }
  }

  const handleConsume = async (socket, producerId, peerId) => {
    if (!device || !device.rtpCapabilities) {
      console.warn("Device가 준비되지 않음")
      return
    }

    try {
      const { id, kind, rtpParameters } = await socketRequest(socket, "consume", {
        producerId,
      })

      // Recv transport가 없으면 send transport 사용 (단순화)
      const consumer = await sendTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      })

      consumers.set(producerId, consumer)

      // 비디오 스트림 처리
      if (kind === "video") {
        createRemoteVideoElement(consumer, peerId)
      }

      // Consumer 재개
      await socketRequest(socket, "resumeConsumer", { consumerId: id })

      console.log("🍿 Consumer 생성 완료:", { id, kind, peerId })
    } catch (error) {
      console.error("Consumer 생성 실패:", error)
    }
  }

  const createRemoteVideoElement = (consumer, peerId) => {
    const stream = new MediaStream([consumer.track])

    const videoElement = document.createElement("video")
    videoElement.srcObject = stream
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = false
    videoElement.className = "remote-video"
    videoElement.style.cssText = `
      width: 300px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin: 5px;
      background: #000;
    `

    // 라벨 추가
    const label = document.createElement("div")
    label.textContent = peerId
    label.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    `

    const container = document.createElement("div")
    container.style.position = "relative"
    container.appendChild(videoElement)
    container.appendChild(label)

    // 원격 비디오 컨테이너에 추가
    const remoteContainer = document.getElementById("remote-videos-container")
    if (remoteContainer) {
      remoteContainer.appendChild(container)
      remoteVideosRef.current.set(peerId, container)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioOn(audioTrack.enabled)
      }
    }
  }

  const cleanup = () => {
    console.log("🧹 RTC 컴포넌트 정리 중...")

    // 로컬 스트림 정리
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    // Producer 정리
    if (producer) {
      producer.close()
    }

    // Consumer 정리
    consumers.forEach((consumer) => consumer.close())
    consumers.clear()

    // Transport 정리
    if (sendTransport) {
      sendTransport.close()
    }

    // 소켓 정리
    if (socket) {
      socket.disconnect()
    }
  }

  const socketRequest = (socket, event, data = {}) => {
    return new Promise((resolve, reject) => {
      socket.emit(event, data, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  if (!isConnected) {
    return (
      <div className="video-rtc-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{connectionStatus}</p>
        </div>
        <style jsx>{`
          .video-rtc-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }
          .loading-spinner {
            text-align: center;
            color: white;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="video-rtc">
      {/* 헤더 */}
      <header className="video-rtc__header">
        <div className="header-info">
          <h2>화상회의 - {roomId}</h2>
          <span className="participant-count">{participants.length + 1}/10명</span>
          {connectionStatus && <span className="status">{connectionStatus}</span>}
        </div>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </header>

      {/* 메인 비디오 영역 */}
      <div className="video-rtc__main">
        {/* 로컬 비디오 */}
        <div className="local-video-container">
          <video ref={localVideoRef} muted autoPlay playsInline className="local-video" />
          <div className="video-label">
            {userNickname} (나)
            {screenShared && <span className="screen-badge">화면공유</span>}
          </div>
        </div>

        {/* 원격 비디오들 */}
        <div id="remote-videos-container" className="remote-videos-container">
          {/* 원격 비디오들이 동적으로 추가됩니다 */}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="video-rtc__controls">
        <button onClick={toggleVideo} className={`control-btn ${videoOn ? "active" : "inactive"}`}>
          {videoOn ? "📹" : "📹❌"}
        </button>

        <button onClick={toggleAudio} className={`control-btn ${audioOn ? "active" : "inactive"}`}>
          {audioOn ? "🎤" : "🎤❌"}
        </button>

        <button onClick={onClose} className="control-btn end-call">
          📞 종료
        </button>
      </div>

      <style jsx>{`
        .video-rtc {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          z-index: 9999;
        }

        .video-rtc__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #2d2d2d;
          color: white;
        }

        .header-info h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .participant-count {
          color: #4CAF50;
          font-weight: bold;
          margin-left: 10px;
        }

        .status {
          color: #ffa500;
          font-size: 0.9rem;
          margin-left: 10px;
        }

        .close-btn {
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .video-rtc__main {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 20px;
          overflow-y: auto;
        }

        .local-video-container {
          position: relative;
          width: 300px;
          height: 200px;
        }

        .local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          background: #000;
        }

        .video-label {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .screen-badge {
          background: #4CAF50;
          margin-left: 5px;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
        }

        .remote-videos-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .video-rtc__controls {
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 20px;
          background: #2d2d2d;
        }

        .control-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .control-btn.active {
          background: #4CAF50;
          color: white;
        }

        .control-btn.inactive {
          background: #ff4444;
          color: white;
        }

        .control-btn.end-call {
          background: #ff4444;
          color: white;
        }
      `}</style>
    </div>
  )
}

export default Video
