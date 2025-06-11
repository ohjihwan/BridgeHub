const socket = io('http://localhost:7600');
let device, sendTransport, recvTransport;

function showVideo(stream, muted = false) {
  const container = document.getElementById('videoContainer');
  document.getElementById('videoContainer').innerHTML = '';
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = muted;
  container.appendChild(video);
}

async function joinRoom(roomId) {
  socket.emit('join-room', { roomId });
  socket.once('rtp-capabilities', async (rtpCapabilities) => {
    device = new window.mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    socket.emit('create-send-transport');
  });
}

socket.on('send-transport-created', async (params) => {
  sendTransport = device.createSendTransport(params);

  sendTransport.on('connect', ({ dtlsParameters }, callback) => {
    socket.emit('connect-transport', { dtlsParameters });
    callback();
  });

  sendTransport.on('produce', ({ kind, rtpParameters }, callback) => {
    socket.emit('produce', { kind, rtpParameters }, ({ id }) => {
      callback({ id });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
 document.getElementById('startCamera').onclick = async () => {
  if (!sendTransport) {
    alert('연결 준비 중입니다. 잠시 후 다시 시도하세요.');
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  stream.getTracks().forEach(track => sendTransport.produce({ track }));

  const container = document.getElementById('videoContainer');
  container.innerHTML = '';
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  container.appendChild(video);
};

  document.getElementById('startScreen').onclick = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStream.getTracks().forEach(track => sendTransport.produce({ track }));
    showVideo(screenStream, true);
  };

  document.getElementById('stopShare').onclick = () => {
    const container = document.getElementById('videoContainer');
    container.innerHTML = `<img id="defaultProfile" src="/basic_profile.png" alt="기본 이미지" />`;
  };
});

socket.on('new-producer', ({ producerId }) => {
  socket.emit('consume', { producerId });
});

socket.on('consumer-created', async (params) => {
  if (!recvTransport) {
    recvTransport = device.createRecvTransport(params.transportOptions);
    recvTransport.on('connect', ({ dtlsParameters }, callback) => {
      socket.emit('connect-recv-transport', { dtlsParameters });
      callback();
    });
  }

  const consumer = await recvTransport.consume({
    id: params.id,
    producerId: params.producerId,
    kind: params.kind,
    rtpParameters: params.rtpParameters
  });

  const stream = new MediaStream();
  stream.addTrack(consumer.track);
  showVideo(stream);
});

joinRoom('test-room');
