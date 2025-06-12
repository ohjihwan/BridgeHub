// 임시 데이터 저장소 (나중에 데이터베이스로 대체)
const studyRooms = new Map();

// 스터디룸 생성
const createStudyRoom = (studyId) => {
    if (!studyRooms.has(studyId)) {
        studyRooms.set(studyId, new Set());
    }
    return studyRooms.get(studyId);
};

// 스터디룸 참가
const joinStudyRoom = (studyId, socket) => {
    const room = createStudyRoom(studyId);
    room.add(socket);
    return room;
};

// 스터디룸 퇴장
const leaveStudyRoom = (studyId, socket) => {
    const room = studyRooms.get(studyId);
    if (room) {
        room.delete(socket);
        if (room.size === 0) {
            studyRooms.delete(studyId);
        }
    }
};

// 메시지 브로드캐스트
const broadcastMessage = (studyId, message) => {
    const room = studyRooms.get(studyId);
    if (room) {
        room.forEach(socket => {
            socket.emit('receive-message', message);
        });
    }
};

// 스터디룸 참가자 목록 조회
const getStudyRoomParticipants = (studyId) => {
    const room = studyRooms.get(studyId);
    if (!room) return [];
    
    return Array.from(room).map(socket => ({
        id: socket.id,
        userId: socket.userId
    }));
};

module.exports = {
    createStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    broadcastMessage,
    getStudyRoomParticipants
}; 