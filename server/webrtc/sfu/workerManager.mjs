import { createWorker } from 'mediasoup';

let worker;

export async function getMediasoupWorker() {
  if (worker) return worker;
  worker = await createWorker({
    rtcMinPort: 20000,
    rtcMaxPort: 20100,
  });
  console.log('[Mediasoup] Worker started');
  return worker;
}
