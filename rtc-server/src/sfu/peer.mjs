export default class Peer {
  constructor(transport) {
    this.transport = transport;
    this.producers = new Map();
    this.consumers = new Map();
  }

  async produce({ kind, rtpParameters, appData }) {
    const producer = await this.transport.produce({ kind, rtpParameters, appData });
    this.producers.set(producer.id, producer);
    return producer;
  }

  async consume({ producerId, rtpCapabilities }) {
    const consumer = await this.transport.consume({ producerId, rtpCapabilities, paused: false });
    this.consumers.set(consumer.id, consumer);
    return consumer;
  }
}
