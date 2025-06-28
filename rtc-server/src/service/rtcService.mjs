import RoomManager from "../sfu/roomManager.mjs";
import { MAX_PEERS_PER_ROOM } from "../config/index.mjs";

const roomMgr = new RoomManager(MAX_PEERS_PER_ROOM);

export function getRoomManager() {
  return roomMgr;
}
