import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

// 다른 PC 접속 시: 서버의 내부 IP 주소 그대로 사용
const socket = io('http://192.168.0.58:7600', {
  transports: ['websocket'],
  reconnectionAttempts: 3,
  timeout: 10000
})

const Video = ({ userNickname = '익명', roomId: roomIdProp, onClose }) => {
  const { roomId: roomIdParam } = useParams()
  const roomId = roomIdProp || roomIdParam
  const safeNickname = userNickname || '익명'
  if (!roomId) return <div>방 ID가 없습니다</div>

  const localVideoRef = useRef(null)
  const [peers, setPeers] = useState({})
  const peerConnections = useRef({})
  const localStream = useRef(null)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  useEffect(() => {
    const init = async () => {
      console.log('🚀 초기화 시작')

      if (!navigator.mediaDevices?.getUserMedia) {
        alert('이 브라우저는 WebRTC를 지원하지 않습니다.')
        return
      }

      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current
          await localVideoRef.current.play()
          console.log('📷 카메라 스트림 시작됨:', localStream.current)
        }

        socket.emit('join', { roomId, nickname: safeNickname })

        socket.emit('createRoom', { roomId })
        socket.emit('join', { roomId, nickname: safeNickname })

        socket.on('allUsers', users => {
          users.forEach(user => createOffer(user.socketId, user.nickname))
        })

        socket.on('getOffer', async ({ socketId, nickname, sdp }) => {
          const pc = createPeerConnection(socketId, nickname)
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('sendAnswer', { sdp: answer, to: socketId })
        })

        socket.on('getAnswer', async ({ socketId, sdp }) => {
          const pc = peerConnections.current[socketId]
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        })

        socket.on('getCandidate', async ({ socketId, candidate }) => {
          const pc = peerConnections.current[socketId]
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate))
        })

        socket.on('userExit', ({ socketId }) => {
          if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close()
            delete peerConnections.current[socketId]
            setPeers(prev => {
              const updated = { ...prev }
              delete updated[socketId]
              return updated
            })
          }
        })
      } catch (err) {
        console.error('❌ 초기화 실패:', err)
      }
    }

    const createPeerConnection = (socketId, nickname) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current)
      })

      pc.onicecandidate = e => {
        if (e.candidate) {
          socket.emit('sendCandidate', { candidate: e.candidate, to: socketId })
        }
      }

      pc.ontrack = e => {
        setPeers(prev => ({
          ...prev,
          [socketId]: { stream: e.streams[0], nickname: nickname || '참여자' }
        }))
      }

      peerConnections.current[socketId] = pc
      return pc
    }

    const createOffer = async (socketId, nickname) => {
      const pc = createPeerConnection(socketId, nickname)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('sendOffer', { sdp: offer, to: socketId })
    }

    init()
    return () => {
      socket.disconnect()
      Object.values(peerConnections.current).forEach(pc => pc.close())
    }
  }, [roomId, safeNickname])

  const toggleVideo = () => {
    const track = localStream.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setVideoOn(track.enabled)
      console.log(`📷 비디오 ${track.enabled ? 'ON' : 'OFF'}`)
    }
  }

  const toggleAudio = () => {
    const track = localStream.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setAudioOn(track.enabled)
      console.log(`🎤 오디오 ${track.enabled ? 'ON' : 'OFF'}`)
    }
  }

  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
          await localVideoRef.current.play()
          console.log('🖥️ 화면 공유 시작됨:', screenStream)
        }

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        })

        screenTrack.onended = stopScreenShare
        setIsScreenSharing(true)
        setVideoOn(false)
      } catch (err) {
        console.error('❌ 화면 공유 실패:', err)
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = async () => {
    console.log('🛑 화면 공유 종료')
    setIsScreenSharing(false)
    setVideoOn(true)

    const cameraTrack = localStream.current?.getVideoTracks()[0]
    const newStream = new MediaStream([cameraTrack])
    localVideoRef.current.srcObject = newStream
    await localVideoRef.current.play()

    Object.values(peerConnections.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video')
      if (sender && cameraTrack) sender.replaceTrack(cameraTrack)
    })
  }

  return (
    <div className="video-container">
      <div className="video-header">
        <strong>방 번호:</strong> {roomId}<br />
        <strong>접속 주소:</strong> {`${window.location.origin}/video/${roomId}`}
      </div>

      <div className="video-highlight">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="screen-video"
        />
        {!videoOn && <div className="nickname-overlay">{safeNickname}</div>}
      </div>

      <div className="video-grid-scroll">
        {Object.entries(peers).map(([id, { stream, nickname }]) => (
          <div key={id} className="peer-box">
            <video
              ref={el => el && (el.srcObject = stream)}
              autoPlay
              playsInline
              className="remote-video"
            />
            {!stream.getVideoTracks()[0].enabled && (
              <div className="nickname-overlay">{nickname}</div>
            )}
          </div>
        ))}
      </div>

      <div className="video-controls">
        <button onClick={toggleAudio}>{audioOn ? '🔈 마이크 끄기' : '🔇 마이크 켜기'}</button>
        <button onClick={toggleVideo}>{videoOn ? '📷 카메라 끄기' : '📴 카메라 켜기'}</button>
        <button onClick={handleScreenShare}>{isScreenSharing ? '🛑 공유 중지' : '🖥️ 화면 공유'}</button>
        <button onClick={onClose || (() => window.history.back())}>❌ 나가기</button>
      </div>

      <style>{`
        .video-container {
          padding: 1rem;
          background: #111;
          color: #fff;
          min-height: 100vh;
        }
        .video-header {
          text-align: center;
          padding: 10px;
          font-size: 18px;
          color: #0a84ff;
        }
        .video-highlight {
          position: relative;
          width: 100%;
          height: 400px;
          background: #000;
        }
        .screen-video, .local-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }
        .nickname-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 20px;
          background: rgba(0,0,0,0.5);
          padding: 8px 16px;
          border-radius: 8px;
        }
        .video-grid-scroll {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          margin-top: 1rem;
        }
        .peer-box {
          position: relative;
          min-width: 250px;
          height: 200px;
          background: #000;
        }
        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }
        .video-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 1rem;
        }
        .video-controls button {
          background: #333;
          color: #fff;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .video-controls button:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}

export default Video
