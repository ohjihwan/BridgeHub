import { v4 as uuidv4 } from 'uuid';
import RoomManager from '../sfu/roomManager.mjs';

export const createRoom = (req, res) => {
  const roomId = uuidv4();
  const success = RoomManager.createRoom(roomId);
  if (success) {
    res.status(200).json({ roomId });
  } else {
    res.status(500).json({ error: 'Room creation failed' });
  }
};

export const deleteRoom = (req, res) => {
  const { roomId } = req.params;
  const room = RoomManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  room.peers.forEach(({ socket }) => {
    socket.emit('room-deleted', { roomId });
    socket.leave(roomId);
  });

  RoomManager.deleteRoom(roomId);
  res.status(200).json({ message: 'Room deleted and peers notified' });
};

export const getRoomList = (req, res) => {
  const roomList = Array.from(RoomManager.rooms.keys()); // or implement getRoomList()
  res.status(200).json({ rooms: roomList });
};

export const leaveRoom = (req, res) => {
  const { roomId, peerId } = req.body;
  RoomManager.leaveRoom(roomId, peerId);
  res.status(200).json({ message: '사용자가 퇴장했습니다.' });
};
