import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 로컬 IP 주소 감지 (mediasoup.mjs와 동일한 함수)
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

export const serverConfig = {
  // 서버 기본 설정
  port: process.env.PORT || 7600,
  host: process.env.HOST || '0.0.0.0',
  
  // HTTPS 설정
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    keyPath: process.env.HTTPS_KEY_PATH || path.join(__dirname, '../../certs/server.key'),
    certPath: process.env.HTTPS_CERT_PATH || path.join(__dirname, '../../certs/server.crt'),
  },

  // CORS 설정
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:7000',
      'http://localhost:7600',
      'http://localhost:7700',
      'https://localhost:3000',
      'https://localhost:7000',
      'https://localhost:7600',
      'https://localhost:7700',
    ],
  },

  // 네트워크 설정
  network: {
    localIp: process.env.LOCAL_IP || getLocalIp(),
  },

  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },

  // 외부 서비스 연동
  services: {
    socketServer: {
      url: process.env.SOCKET_SERVER_URL || 'http://localhost:7500',
      enabled: process.env.SOCKET_SERVER_INTEGRATION === 'true',
    },
  },
}
