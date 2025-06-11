import { createWorker } from "mediasoup";

let worker;

export async function getWorker() {
  if (!worker) {
    worker = await createWorker({
      logLevel: "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: 40000,
      rtcMaxPort: 49999
    });

    worker.on("died", () => {
      console.error("Mediasoup worker died, exiting...");
      process.exit(1);
    });
  }

  return worker;
}
