export default class Peer {
  constructor(router, socket, roomId) {
    this.router    = router;
    this.socket    = socket;
    this.roomId    = roomId;
    this.transports = new Map();
    this.producers  = new Map();
    this.consumers  = new Map();
  }

  async createWebRtcTransport(options) {
    const transport = await this.router.createWebRtcTransport(options);
    this.transports.set(transport.id, transport);
    transport.on('dtlsstatechange', state => {
      if (state === 'closed') this.transports.delete(transport.id);
    });
    return transport;
  }

  async connectTransport(id, dtlsParameters) {
    const transport = this.transports.get(id);
    await transport.connect({ dtlsParameters });
  }

  async produce({ kind, rtpParameters, appData }) {
    // 기본 transport 하나만 사용 예시
    const transport = this.transports.values().next().value;
    const producer  = await transport.produce({ kind, rtpParameters, appData });
    this.producers.set(producer.id, producer);
    return producer;
  }

  canConsume(producerId, rtpCapabilities) {
    return this.router.canConsume({ producerId, rtpCapabilities });
  }

  async consume({ producerId, rtpCapabilities }) {
    const transport = this.transports.values().next().value;
    const consumer  = await transport.consume({ producerId, rtpCapabilities, paused: false });
    this.consumers.set(consumer.id, consumer);
    return consumer;
  }
}
