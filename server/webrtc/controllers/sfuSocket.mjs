import { createWebRtcTransport, initRouter } from "../sfu/mediasoupServer.mjs";
import { getOrCreateRoom, getRoom } from "../models/room.mjs";
import {
  addPeer,
  getPeer,
  removePeer,
  addTransport,
  addProducer,
  addConsumer,
} from "../services/peerService.mjs";

export default function handleSfuSocket(io) {
  io.on("connection", (socket) => {
    const peerId = socket.id;
    let currentRoomId;

    socket.on("join-room", async ({ roomId }) => {
      currentRoomId = roomId;

      const room = await getOrCreateRoom(roomId, initRouter);
      addPeer(peerId);

      socket.emit("rtp-capabilities", room.router.rtpCapabilities);
    });

    socket.on("create-send-transport", async () => {
      const { transport, params } = await createWebRtcTransport(peerId, "send");
      addTransport(peerId, transport);

      socket.emit("send-transport-created", params);

      transport.on("dtlsstatechange", (state) => {
        if (state === "closed") transport.close();
      });

      socket.on("connect-transport", ({ dtlsParameters }) => {
        transport.connect({ dtlsParameters });
      });

      socket.on("produce", async ({ kind, rtpParameters }, callback) => {
        const producer = await transport.produce({ kind, rtpParameters });
        addProducer(peerId, producer);

        socket.broadcast.emit("new-producer", { producerId: producer.id });
        callback({ id: producer.id });
      });
    });

    socket.on("create-recv-transport", async (_, callback) => {
      const { transport, params } = await createWebRtcTransport(peerId, "recv");
      transport.appData = { direction: "recv" };

      socket.on("connect-recv-transport", ({ dtlsParameters }) => {
        transport.connect({ dtlsParameters });
      });

      addTransport(peerId, transport);
      callback(params);
    });

    socket.on("consume", async ({ producerId }, callback) => {
      const room = getRoom(currentRoomId);
      const router = room.router;

      const consumerTransport = getPeer(peerId).transports.find(
        (t) => t.appData.direction === "recv"
      );

      const consumer = await consumerTransport.consume({
        producerId,
        rtpCapabilities: router.rtpCapabilities,
        paused: false,
      });

      addConsumer(peerId, consumer);

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    });

    socket.on("disconnect", () => {
      removePeer(peerId);
    });
  });
}
