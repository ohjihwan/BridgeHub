import fs      from 'fs';
import https   from 'https';
import { Server as IOServer } from 'socket.io';
import app     from './app.mjs';
import bindSignaling from './signaling/index.mjs';
import { RTC_PORT, SSL_KEY_PATH, SSL_CERT_PATH } from './config/index.mjs';
import { log } from './utils/logger.mjs';

(async () => {
  // HTTPS 서버
  const httpsServer = https.createServer({
    key:  fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  }, app);

  // Socket.IO (시그널링 전용 네임스페이스)
  const io = new IOServer(httpsServer, {
    path: '/socket.io',
    cors: { origin: '*' }
  });
  const rtcNs = io.of('/rtc');
  await bindSignaling(rtcNs);

  // 시작
  httpsServer.listen(RTC_PORT, () => {
    log(`🚀 RTC server running on https://thebridgehub.org/rtc (port ${RTC_PORT})`);
  });
})();
