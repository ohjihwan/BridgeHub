import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('ws://192.168.0.58:7600', { transports: ['websocket'] });

const Video = () => {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomList, setRoomList] = useState([]);
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState({});
  const [screenSharing, setScreenSharing] = useState(false);

  const myVideo = useRef(null);
  const peerVideos = useRef({});
  const chatInput = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    socket.on('room-list', (rooms) => setRoomList(rooms));

    socket.on('peer-joined', ({ id, nickname }) => {
      createPeerConnection(id, nickname, true);
    });

    socket.on('peer-list', (peers) => {
      peers.forEach(({ id, nickname }) => {
        createPeerConnection(id, nickname, true);
      });
    });

    socket.on('rtc-message', async ({ from, event, data }) => {
      const pc = peerConnections.current[from];
      if (!pc) return;

      if (event === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('rtc-message', { roomId, to: from, event: 'answer', data: answer });
      } else if (event === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } else if (event === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });

    socket.on('peer-left', ({ id }) => {
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
        setPeers(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    });
  }, [roomId]);

  const createRoom = () => {
    if (!nickname) return alert('닉네임 입력 필요');
    const newRoomId = 'room-' + Date.now();
    socket.emit('create-room', newRoomId);
    joinRoom(newRoomId);
  };

  const joinRoom = async (room) => {
    if (!nickname) return alert('닉네임 입력 필요');
    setRoomId(room);
    setJoined(true);

    socket.emit('join', { roomId: room, nickname });
    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.current.srcObject = localStream.current;
  };

  const createPeerConnection = async (id, nick, offer) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));

    pc.onicecandidate = e => {
      if (e.candidate) socket.emit('rtc-message', { roomId, to: id, event: 'candidate', data: e.candidate });
    };

    pc.ontrack = e => {
      setPeers(prev => ({ ...prev, [id]: { stream: e.streams[0], nickname: nick } }));
    };

    peerConnections.current[id] = pc;

    if (offer) {
      const sdpOffer = await pc.createOffer();
      await pc.setLocalDescription(sdpOffer);
      socket.emit('rtc-message', { roomId, to: id, event: 'offer', data: sdpOffer });
    }
  };

  const shareScreen = async () => {
    if (screenSharing) return stopScreenShare();
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];

    for (const pc of Object.values(peerConnections.current)) {
      const sender = pc.getSenders().find(s => s.track.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    }

    if (myVideo.current) {
      myVideo.current.srcObject = screenStream;
    }

    screenTrack.onended = () => stopScreenShare();
    setScreenSharing(true);
  };

  const stopScreenShare = async () => {
    const videoTrack = localStream.current.getVideoTracks()[0];
    for (const pc of Object.values(peerConnections.current)) {
      const sender = pc.getSenders().find(s => s.track.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    }
    if (myVideo.current) {
      myVideo.current.srcObject = localStream.current;
    }
    setScreenSharing(false);
  };

  const leaveRoom = () => {
    socket.disconnect();
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setPeers({});
    setJoined(false);
    setRoomId('');
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임 입력" />
          <button onClick={createRoom}>방 만들기</button>
          <ul>
            {roomList.map((id) => (
              <li key={id}>
                {id} <button onClick={() => joinRoom(id)}>입장</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h3>Room: {roomId}</h3>
          <video ref={myVideo} autoPlay muted playsInline width={screenSharing ? '100%' : 320} />
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {Object.entries(peers).map(([id, { stream, nickname }]) => (
              <div key={id}>
                <div>{nickname}</div>
                <video
                  ref={(el) => el && (el.srcObject = stream)}
                  autoPlay
                  playsInline
                  muted={false}
                  width={screenSharing ? 160 : 320}
                />
              </div>
            ))}
          </div>
          <div>
            <button onClick={shareScreen}>{screenSharing ? '화면 공유 중지' : '화면 공유'}</button>
            <button onClick={leaveRoom}>나가기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;