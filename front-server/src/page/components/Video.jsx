import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

const Video = ({ onClose, userNickname, roomId }) => {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [sendTransport, setSendTrans] = useState(null);
  const [recvTransport, setRecvTrans] = useState(null);
  const [socket, setSocket] = useState(null);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShared, setScreen] = useState(false);

  useEffect(() => {
    setVideoOn(window.confirm('카메라를 켜시겠습니까?'));
  }, []);

  useEffect(() => {
    if (!roomId) return;

    // 🔒 TURN 서버 설정
    const iceServers = [
      {
        urls: process.env.NEXT_PUBLIC_TURN_URL,
        username: process.env.NEXT_PUBLIC_TURN_USER,
        credential: process.env.NEXT_PUBLIC_TURN_PASS,
      }
    ];

    // 🌐 socket 연결
    const sock = io(process.env.NEXT_PUBLIC_SIGNALING_URL, {
      path: '/rtc',
      auth: {
        token: localStorage.getItem('token'),
        roomId,
        iceServers, // TURN 정보도 함께 전달
      }
    });

    setSocket(sock);

    // 🚫 방 꽉 찼을 때 처리
    sock.on('connect_error', err => {
      if (err.message === 'ROOM_FULL') {
        alert('방이 가득 찼습니다 (최대 10명)');
        onClose();
      }
    });

    // 📡 라우터 RTP Capabilities 수신
    sock.on('rtp-capabilities', async ({ rtpCapabilities }) => {
      const dev = new mediasoupClient.Device();
      await dev.load({ routerRtpCapabilities: rtpCapabilities });
      setDevice(dev);
      sock.emit('create-send-transport');
    });

    // 🔀 전송용 transport 생성
    sock.on('send-transport-created', async params => {
      const transport = device.createSendTransport(params);
      transport.on('connect', ({ dtlsParameters }, cb) => {
        sock.emit('connect-transport', { dtlsParameters });
        cb();
      });
      transport.on('produce', ({ kind, rtpParameters }, cb) => {
        sock.emit('produce', { kind, rtpParameters }, ({ id }) => cb({ id }));
      });
      setSendTrans(transport);
    });

    // 🆕 상대 프로듀서 감지
    sock.on('new-producer', ({ producerId }) => {
      if (!recvTransport) {
        sock.emit('create-recv-transport');
      }
      sock.emit('consume', { producerId, rtpCapabilities: device.rtpCapabilities });
    });

    // 📥 수신용 transport 생성
    sock.on('recv-transport-created', async params => {
      const rTransport = device.createRecvTransport(params);
      rTransport.on('connect', ({ dtlsParameters }, cb) => {
        sock.emit('connect-recv-transport', { dtlsParameters });
        cb();
      });
      setRecvTrans(rTransport);
    });

    // 📺 수신 consumer 생성
    sock.on('consumer-created', async ({ params }) => {
      const consumer = await recvTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters
      });
      const ms = new MediaStream([consumer.track]);
      remoteRef.current.srcObject = ms;
    });

    return () => {
      sock.emit('leave-room', { roomId });
      sock.disconnect();
      sendTransport?.close();
      recvTransport?.close();
      onClose();
    };
  }, [roomId]);

  const startCamera = async () => {
    if (!sendTransport) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: true });
    localRef.current.srcObject = stream;
    stream.getTracks().forEach(track =>
      sendTransport.produce({ track, appData: { peerId: socket.id, nickname: userNickname } })
    );
  };

  const toggleScreen = async () => {
    if (!sendTransport) return;
    if (!screenShared) {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      localRef.current.srcObject = screen;
      screen.getTracks().forEach(track =>
        sendTransport.produce({ track, appData: { peerId: socket.id, nickname: userNickname } })
      );
      setScreen(true);
    } else {
      setScreen(false);
    }
  };

  return (
    <div className="video-rtc">
      <header className="video-rtc__header">
        <h2>영상 통화</h2>
        <button onClick={onClose}>✕</button>
      </header>
      <div className="video-rtc__screen">
        {videoOn
          ? <video ref={remoteRef} autoPlay playsInline className="video-rtc__remote" />
          : <div className="video-rtc__placeholder"><span>{userNickname}</span></div>
        }
        <video
          ref={localRef}
          muted
          autoPlay
          playsInline
          className="video-rtc__local"
          style={{ display: videoOn ? 'block' : 'none' }}
        />
      </div>
      <div className="video-rtc__controls">
        <button onClick={startCamera}>{videoOn ? '카메라 시작' : '비디오 켜기'}</button>
        <button onClick={toggleScreen}>{screenShared ? '공유 중지' : '화면 공유'}</button>
        <button onClick={onClose}>종료</button>
      </div>
    </div>
  );
};

export default Video;
