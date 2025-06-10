const rooms = new Map(); // roomId => { router, peers }

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function createRoom(roomId, router) {
  rooms.set(roomId, {
    router,
    peers: new Map()
  });
}

export function hasRoom(roomId) {
  return rooms.has(roomId);
}

export function deleteRoom(roomId) {
  rooms.delete(roomId);
}

export async function getOrCreateRoom(roomId, initRouterFn) {
  if (!rooms.has(roomId)) {
    const router = await initRouterFn();
    createRoom(roomId, router);
  }
  return rooms.get(roomId);
}
