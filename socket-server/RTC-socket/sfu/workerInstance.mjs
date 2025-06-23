import { createWorker } from "mediasoup";
import dotenv from "dotenv";
dotenv.config();

let worker;

/**
 * Mediasoup Worker 인스턴스 반환 (없으면 생성)
 * @returns {Promise<Worker>}
 */
export async function getWorker() {
  if (!worker) {
    worker = await createWorker({
      logLevel: process.env.MEDIASOUP_LOG_LEVEL,
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: Number(process.env.MEDIASOUP_MIN_PORT),
      rtcMaxPort: Number(process.env.MEDIASOUP_MAX_PORT),
    });

    worker.on("died", () => {
      console.error("Mediasoup worker died, exiting...");
      process.exit(1);
    });
  }
  return worker;
}
