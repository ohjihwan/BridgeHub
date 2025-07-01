
"use client"
import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import * as mediasoupClient from "mediasoup-client"

const Video = ({ onClose, roomId }) => {
  const localRef = useRef(null)
  const remoteRef = useRef(null)
  const [device, setDevice] = useState(null)
  const [sendTransport, setSendTrans] = useState(null)
  const [recvTransport, setRecvTrans] = useState(null)
  const [socket, setSocket] = useState(null)
  const [videoOn, setVideoOn] = useState(true)
  const [screenShared, setScreen] = useState(false)
  const [producers, setProducers] = useState(new Map())
  const [consumers, setConsumers] = useState(new Map())
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    setVideoOn(window.confirm("카메라를 켜시겠습니까?"))
  }, [])

  useEffect(() => {
    if (!roomId) return

    const sock = io(process.env.NEXT_PUBLIC_SIGNALING_URL, {
      path: "/rtc",
      transports: ["websocket"]
    })

    setSocket(sock)

    sock.on("connect", () => {
      console.log("✅ RTC 서버 연결됨")
      sock.emit("join", {
        roomId,
        token: localStorage.getItem("token")
      })
    })

    sock.on("peer-list", (peers) => {
      console.log("🟢 peer-list 수신:", peers)
      setParticipants(peers)
    })

    sock.on("peer-joined", ({ id, nickname }) => {
      setParticipants((prev) => [...prev, { socketId: id, nickname }])
    })

    sock.on("peer-left", ({ id }) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== id))
      consumers.forEach((consumer, key) => {
        if (key.includes(id)) {
          consumer.close()
          consumers.delete(key)
        }
      })
    })

    sock.on("connect_error", (err) => {
      console.error("연결 실패:", err.message)
      alert("RTC 서버 연결 실패")
      onClose()
    })

    return () => {
      producers.forEach((producer) => producer.close())
      producers.clear()

      consumers.forEach((consumer) => consumer.close())
      consumers.clear()

      sendTransport?.close()
      recvTransport?.close()

      if (sock) {
        sock.emit("leave-room", { roomId })
        sock.disconnect()
      }

      onClose()
    }
  }, [roomId])

  const startCamera = async () => {
    if (!sendTransport) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: true,
      })
      if (localRef.current) localRef.current.srcObject = stream

      for (const track of stream.getTracks()) {
        const producer = await sendTransport.produce({
          track,
          appData: { peerId: socket.id }
        })
        producers.set(track.kind, producer)
      }
    } catch (err) {
      console.error("카메라 시작 실패:", err)
    }
  }

  const toggleScreen = async () => {
    if (!sendTransport) return

    try {
      if (!screenShared) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        if (localRef.current) localRef.current.srcObject = screenStream

        const existingVideoProducer = producers.get("video")
        if (existingVideoProducer) existingVideoProducer.close()

        const videoTrack = screenStream.getVideoTracks()[0]
        if (videoTrack) {
          const screenProducer = await sendTransport.produce({
            track: videoTrack,
            appData: { peerId: socket.id, isScreen: true }
          })
          producers.set("video", screenProducer)
          videoTrack.onended = () => {
            setScreen(false)
            startCamera()
          }
        }
        setScreen(true)
      } else {
        const screenProducer = producers.get("video")
        if (screenProducer) screenProducer.close()
        setScreen(false)
        setTimeout(() => startCamera(), 100)
      }
    } catch (err) {
      console.error("화면 공유 실패:", err)
    }
  }

  return (
    <div className="video-rtc">
      <header className="video-rtc__header">
        <h2>영상 통화</h2>
        <button onClick={onClose}>✕</button>
      </header>
      <div className="video-rtc__screen">
        {videoOn ? (
          <video ref={remoteRef} autoPlay playsInline className="video-rtc__remote" />
        ) : (
          <div className="video-rtc__placeholder">
            <span>상대 참가자 없음</span>
          </div>
        )}
        <video
          ref={localRef}
          muted
          autoPlay
          playsInline
          className="video-rtc__local"
          style={{ display: videoOn ? "block" : "none" }}
        />
      </div>
      <div className="video-rtc__controls">
        <button onClick={startCamera}>카메라 시작</button>
        <button onClick={toggleScreen}>{screenShared ? "공유 중지" : "화면 공유"}</button>
        <button onClick={onClose}>종료</button>
      </div>
    </div>
  )
}

export default Video
