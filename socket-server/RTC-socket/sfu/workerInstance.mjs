import { createWorker } from "mediasoup";

let worker;

/**
 * Mediasoup Worker 인스턴스 반환 (없으면 생성)
 * @returns {Promise<Worker>}
 */
export async function getWorker() {
  if (!worker) {
    worker = await createWorker({
      logLevel: process.env.MEDIASOUP_LOG_LEVEL || "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: Number(process.env.MEDIASOUP_MIN_PORT) || 40000,
      rtcMaxPort: Number(process.env.MEDIASOUP_MAX_PORT) || 49999,
    });

    worker.on("died", () => {
      console.error("Mediasoup worker died, exiting...");
      process.exit(1);
    });
  }
  return worker;
}