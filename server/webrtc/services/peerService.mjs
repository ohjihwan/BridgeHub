const peers = new Map(); // peerId => { transports, producers, consumers }

export function addPeer(peerId) {
  if (!peers.has(peerId)) {
    peers.set(peerId, {
      transports: [],
      producers: [],
      consumers: []
    });
  }
}

export function getPeer(peerId) {
  return peers.get(peerId);
}

export function removePeer(peerId) {
  peers.delete(peerId);
}

export function addTransport(peerId, transport) {
  getPeer(peerId).transports.push(transport);
}

export function addProducer(peerId, producer) {
  getPeer(peerId).producers.push(producer);
}

export function addConsumer(peerId, consumer) {
  getPeer(peerId).consumers.push(consumer);
}
