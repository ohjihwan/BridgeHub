"use client"
import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import * as mediasoupClient from "mediasoup-client"

const Video = ({ onClose, userNickname, roomId }) => {
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

    // 🌐 socket 연결 (RTC 백엔드 기준)
    const sock = io(process.env.NEXT_PUBLIC_SIGNALING_URL, {
      path: "/rtc",
      auth: {
        token: localStorage.getItem("token"),
        username: userNickname,
      },
    })

    setSocket(sock)

    // 🔗 연결 성공
    sock.on("connect", () => {
      console.log("RTC 서버 연결 성공")
      // 룸 입장 요청
      sock.emit("join-room", {
        roomId,
        nickname: userNickname,
      })
    })

    // 🚫 연결 오류 처리
    sock.on("connect_error", (err) => {
      console.error("연결 오류:", err)
      alert("서버 연결에 실패했습니다.")
      onClose()
    })

    // 🏠 룸 입장 성공
    sock.on("joined-room", async (response) => {
      if (response.success) {
        console.log("룸 입장 성공:", response)
        setParticipants(response.participants || [])

        // mediasoup device 초기화
        const dev = new mediasoupClient.Device()

        // RTP capabilities는 서버에서 직접 가져오기
        try {
          // Send transport 생성 요청
          sock.emit("create-send-transport")
        } catch (error) {
          console.error("Device 로드 실패:", error)
        }

        setDevice(dev)

        // 기존 참가자들의 producer 처리
        if (response.producers && response.producers.length > 0) {
          response.producers.forEach((producer) => {
            handleNewProducer(producer)
          })
        }
      }
    })

    // 🚫 룸 입장 실패
    sock.on("join-error", (error) => {
      console.error("룸 입장 실패:", error)
      if (error.code === "ROOM_FULL") {
        alert("방이 가득 찼습니다 (최대 10명)")
      } else if (error.code === "NOT_MEMBER") {
        alert("스터디룸 멤버가 아닙니다.")
      } else {
        alert(`입장 실패: ${error.message}`)
      }
      onClose()
    })

    // 🔀 전송용 transport 생성 응답
    sock.on("send-transport-created", async (params) => {
      try {
        if (!device) {
          const dev = new mediasoupClient.Device()
          setDevice(dev)
        }

        const transport = device.createSendTransport(params)

        transport.on("connect", ({ dtlsParameters }, callback) => {
          sock.emit(
            "connect-transport",
            {
              transportId: transport.id,
              dtlsParameters,
            },
            callback,
          )
        })

        transport.on("produce", ({ kind, rtpParameters }, callback) => {
          sock.emit("produce", { kind, rtpParameters }, callback)
        })

        transport.on("connectionstatechange", (state) => {
          console.log("Send transport state:", state)
        })

        setSendTrans(transport)

        // transport 생성 후 recv transport도 생성
        sock.emit("create-recv-transport")
      } catch (error) {
        console.error("Send transport 생성 실패:", error)
      }
    })

    // 📥 수신용 transport 생성 응답
    sock.on("recv-transport-created", async (params) => {
      try {
        if (!device) return

        const rTransport = device.createRecvTransport(params)

        rTransport.on("connect", ({ dtlsParameters }, callback) => {
          sock.emit(
            "connect-transport",
            {
              transportId: rTransport.id,
              dtlsParameters,
            },
            callback,
          )
        })

        rTransport.on("connectionstatechange", (state) => {
          console.log("Recv transport state:", state)
        })

        setRecvTrans(rTransport)
      } catch (error) {
        console.error("Recv transport 생성 실패:", error)
      }
    })

    // 🆕 새로운 참가자 입장
    sock.on("new-participant", (participant) => {
      console.log("새 참가자:", participant)
      setParticipants((prev) => [...prev, participant])
    })

    // 👋 참가자 퇴장
    sock.on("participant-left", ({ socketId }) => {
      console.log("참가자 퇴장:", socketId)
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))

      // 해당 참가자의 consumer 정리
      consumers.forEach((consumer, key) => {
        if (key.includes(socketId)) {
          consumer.close()
          consumers.delete(key)
        }
      })
    })

    // 🆕 새로운 producer 감지
    sock.on("new-producer", ({ producerId, kind, socketId }) => {
      console.log("새 producer:", { producerId, kind, socketId })
      handleNewProducer({ producerId, kind, socketId })
    })

    // 📺 consumer 생성 응답
    sock.on("consumer-created", async ({ id, producerId, kind, rtpParameters }) => {
      try {
        if (!recvTransport) {
          console.warn("Recv transport가 준비되지 않음")
          return
        }

        const consumer = await recvTransport.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        })

        consumers.set(producerId, consumer)

        // Resume consumer
        sock.emit("resume-consumer", { consumerId: id })

        // 비디오 스트림 처리
        if (kind === "video") {
          const stream = new MediaStream([consumer.track])
          if (remoteRef.current) {
            remoteRef.current.srcObject = stream
          }
        }

        console.log("Consumer 생성 완료:", { id, kind })
      } catch (error) {
        console.error("Consumer 생성 실패:", error)
      }
    })

    // 🎬 transport 오류 처리
    sock.on("transport-error", (error) => {
      console.error("Transport 오류:", error)
    })

    return () => {
      console.log("컴포넌트 정리 중...")

      // Producer 정리
      producers.forEach((producer) => producer.close())
      producers.clear()

      // Consumer 정리
      consumers.forEach((consumer) => consumer.close())
      consumers.clear()

      // Transport 정리
      if (sendTransport) {
        sendTransport.close()
      }
      if (recvTransport) {
        recvTransport.close()
      }

      // 룸 퇴장
      if (sock) {
        sock.emit("leave-room", { roomId })
        sock.disconnect()
      }

      onClose()
    }
  }, [roomId])

  // 새 producer 처리 함수
  const handleNewProducer = ({ producerId, kind, socketId }) => {
    if (!device || !device.rtpCapabilities) {
      console.warn("Device가 준비되지 않음")
      return
    }

    // Consumer 생성 요청
    socket.emit("consume", {
      producerId,
      rtpCapabilities: device.rtpCapabilities,
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
        audio: true,
      })

      if (localRef.current) {
        localRef.current.srcObject = stream
      }

      // 각 트랙을 개별적으로 produce
      for (const track of stream.getTracks()) {
        const producer = await sendTransport.produce({
          track,
          appData: {
            peerId: socket.id,
            nickname: userNickname,
          },
        })

        producers.set(track.kind, producer)
        console.log(`${track.kind} producer 생성:`, producer.id)
      }
    } catch (error) {
      console.error("카메라 시작 실패:", error)
      alert("카메라/마이크 접근에 실패했습니다.")
    }
  }

  const toggleScreen = async () => {
    if (!sendTransport) {
      console.warn("Send transport가 준비되지 않음")
      return
    }

    try {
      if (!screenShared) {
        // 화면 공유 시작
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        if (localRef.current) {
          localRef.current.srcObject = screenStream
        }

        // 기존 비디오 producer 교체
        const existingVideoProducer = producers.get("video")
        if (existingVideoProducer) {
          existingVideoProducer.close()
        }

        const videoTrack = screenStream.getVideoTracks()[0]
        if (videoTrack) {
          const screenProducer = await sendTransport.produce({
            track: videoTrack,
            appData: {
              peerId: socket.id,
              nickname: userNickname,
              isScreen: true,
            },
          })

          producers.set("video", screenProducer)

          // 화면 공유 종료 감지
          videoTrack.onended = () => {
            setScreen(false)
            // 다시 카메라로 전환
            startCamera()
          }
        }

        setScreen(true)
      } else {
        // 화면 공유 중지
        const screenProducer = producers.get("video")
        if (screenProducer) {
          screenProducer.close()
        }

        setScreen(false)

        // 카메라로 다시 전환
        setTimeout(() => {
          startCamera()
        }, 100)
      }
    } catch (error) {
      console.error("화면 공유 토글 실패:", error)
      alert("화면 공유에 실패했습니다.")
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
            <span>{userNickname}</span>
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
        <button type="button" className="video-rtc__control" onClick={startCamera}>{videoOn ? "카메라 시작" : "비디오 켜기"}</button>
        <button type="button" className="video-rtc__control" onClick={toggleScreen}>{screenShared ? "공유 중지" : "화면 공유"}</button>
        <button type="button" className="video-rtc__control" onClick={onClose}>종료</button>
      </div>

      {/* 참가자 목록 (디버깅용) */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px",
            fontSize: "12px",
          }}
        >
          <div>참가자: {participants.length}</div>
          <div>Producers: {producers.size}</div>
          <div>Consumers: {consumers.size}</div>
          <div>Send Transport: {sendTransport ? "✅" : "❌"}</div>
          <div>Recv Transport: {recvTransport ? "✅" : "❌"}</div>
        </div>
      )}
    </div>
  )
}

export default Video
