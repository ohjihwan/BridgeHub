const rooms = new Map();

export function getRoom(roomId) { return rooms.get(roomId) || null; }
export function hasRoom(roomId) { return rooms.has(roomId); }
export function deleteRoom(roomId) { rooms.delete(roomId); }

export async function getOrCreateRoom(roomId, initRouterFn) {
  if (!rooms.has(roomId)) {
    const { router } = await initRouterFn(roomId);
    rooms.set(roomId, { router, peers: new Map() });
  }
  return rooms.get(roomId);
}

export function addPeerToRoom(roomId, peerId, peerObj) {
  const room = rooms.get(roomId);
  if (room) room.peers.set(peerId, peerObj);
}
export function removePeerFromRoom(roomId, peerId) {
  const room = rooms.get(roomId);
  if (room) room.peers.delete(peerId);
}
export function getPeersInRoom(roomId) {
  const room = rooms.get(roomId);
  return room ? Array.from(room.peers.keys()) : [];
}
