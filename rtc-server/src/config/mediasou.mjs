import os from 'os'

// 로컬 IP 주소 감지 함수
function getLocalIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        return networkInterface.address
      }
    }
  }
  return '127.0.0.1'
}

const localIp = getLocalIp()

export const mediasoupConfig = {
  // Worker 설정
  worker: {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'debug',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
    ],
  },
  
  // Router 설정
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '4d0032',
          'level-asymmetry-allowed': 1,
        },
      },
    ],
  },
  
  // WebRTC Transport 설정 (로컬 환경용)
  webRtcTransport: {
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: localIp, // 로컬 IP 사용
      },
    ],
    maxIncomingBitrate: 1500000,
    initialAvailableOutgoingBitrate: 1000000,
  },
  
  // Plain Transport 설정 (필요시)
  plainTransport: {
    listenIp: {
      ip: '0.0.0.0',
      announcedIp: localIp,
    },
  },
}
