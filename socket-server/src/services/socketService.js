// 임시 데이터 저장소 (나중에 데이터베이스로 대체)
const studyRooms = new Map();
let io = null; // Socket.IO 인스턴스를 저장

// Socket.IO 인스턴스 설정
const setSocketIO = (socketIO) => {
    io = socketIO;
};

// 스터디룸 생성
const createStudyRoom = (studyId) => {
    if (!studyRooms.has(studyId)) {
        studyRooms.set(studyId, new Set());
    }
    return studyRooms.get(studyId);
};

// 스터디룸 참가
function joinStudyRoom(socket, studyId, userId) {
    try {
        // 기존 스터디룸에서 나가기
        if (socket.currentStudyId) {
            leaveStudyRoom(socket);
        }

        // 새 스터디룸 참가
        socket.join(studyId.toString());
        socket.currentStudyId = studyId;
        socket.userId = userId;

        // 스터디룸 참가자 목록 업데이트
        if (!studyRooms.has(studyId)) {
            studyRooms.set(studyId, new Set());
        }
        studyRooms.get(studyId).add(userId);

        console.log(`사용자 ${userId}가 스터디룸 ${studyId}에 참가했습니다.`);

        return {
            success: true,
            message: `스터디룸 ${studyId} 참가 완료`,
            data: {
                studyId,
                userId,
                participants: Array.from(studyRooms.get(studyId))
            }
        };
    } catch (error) {
        console.error('스터디룸 참가 에러:', error);
        return {
            success: false,
            error: '스터디룸 참가에 실패했습니다.'
        };
    }
}

// 스터디룸 퇴장
function leaveStudyRoom(socket) {
    try {
        const studyId = socket.currentStudyId;
        const userId = socket.userId;
        
        if (!studyId) return { success: true };

        socket.leave(studyId.toString());
        delete socket.currentStudyId;

        // 스터디룸 참가자 목록 업데이트
        if (studyRooms.has(studyId)) {
            const participants = studyRooms.get(studyId);
            participants.delete(userId);
            if (participants.size === 0) {
                studyRooms.delete(studyId);
            }
        }

        console.log(`사용자 ${userId}가 스터디룸 ${studyId}에서 퇴장했습니다.`);

        return {
            success: true,
            message: `스터디룸 ${studyId} 퇴장 완료`
        };
    } catch (error) {
        console.error('스터디룸 퇴장 에러:', error);
        return {
            success: false,
            error: '스터디룸 퇴장에 실패했습니다.'
        };
    }
}

// 메시지 브로드캐스트
function broadcastMessage(studyId, messageData) {
    try {
        if (!io) {
            console.error('Socket.IO 인스턴스가 설정되지 않았습니다.');
            return { success: false, error: 'Socket.IO 인스턴스가 없습니다.' };
        }

        // 해당 스터디룸의 모든 클라이언트에게 메시지 전송
        io.to(studyId.toString()).emit('message-received', messageData);
        
        console.log(`스터디룸 ${studyId}에 메시지 브로드캐스트:`, messageData.content || messageData.type);
        
        return { success: true };
    } catch (error) {
        console.error('메시지 브로드캐스트 에러:', error);
        return { success: false, error: error.message };
    }
}

// 메시지 전송
function sendMessage(socket, data) {
    try {
        const { studyId, message } = data;
        if (!studyId || !message) {
            return {
                success: false,
                error: '스터디 ID와 메시지가 필요합니다.'
            };
        }

        if (!socket.currentStudyId || socket.currentStudyId !== studyId) {
            return {
                success: false,
                error: '해당 스터디룸에 참가되어 있지 않습니다.'
            };
        }

        const messageData = {
            studyId,
            userId: socket.userId,
            userName: socket.userName,
            message,
            timestamp: new Date()
        };

        return {
            success: true,
            message: '메시지 전송 완료',
            data: messageData
        };
    } catch (error) {
        console.error('메시지 전송 에러:', error);
        return {
            success: false,
            error: '메시지 전송에 실패했습니다.'
        };
    }
}

// 파일 업로드 완료 처리
function handleFileUploadComplete(socket, data) {
    try {
        const { studyId, fileName, fileUrl } = data;
        if (!studyId || !fileName || !fileUrl) {
            return {
                success: false,
                error: '필요한 파일 정보가 누락되었습니다.'
            };
        }

        if (!socket.currentStudyId || socket.currentStudyId !== studyId) {
            return {
                success: false,
                error: '해당 스터디룸에 참가되어 있지 않습니다.'
            };
        }

        const fileData = {
            studyId,
            userId: socket.userId,
            userName: socket.userName,
            fileName,
            fileUrl,
            timestamp: new Date()
        };

        return {
            success: true,
            message: '파일 업로드 알림 전송 완료',
            data: fileData
        };
    } catch (error) {
        console.error('파일 업로드 처리 에러:', error);
        return {
            success: false,
            error: '파일 업로드 처리에 실패했습니다.'
        };
    }
}

// 스터디룸 참가자 목록 조회
const getStudyRoomParticipants = (studyId) => {
    const room = studyRooms.get(studyId);
    if (!room) return [];
    
    return Array.from(room);
};

// 특정 사용자에게 메시지 전송
function broadcastToUser(userId, message) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    // 해당 사용자가 연결된 모든 소켓에 메시지 전송
    io.sockets.sockets.forEach((socket) => {
        if (socket.userId === userId.toString()) {
            socket.emit('system-message', message);
        }
    });
}

// 채팅방에서 특정 사용자 제거
function removeUserFromRoom(roomId, userId) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    // 해당 사용자가 연결된 모든 소켓에서 채팅방 제거
    io.sockets.sockets.forEach((socket) => {
        if (socket.userId === userId.toString() && socket.currentStudyId === roomId.toString()) {
            socket.leave(roomId.toString());
            socket.currentStudyId = null;
            console.log(`사용자 ${userId}를 채팅방 ${roomId}에서 제거했습니다.`);
        }
    });
}

// 특정 사용자의 소켓 연결 강제 종료
function disconnectUser(userId) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    // 해당 사용자가 연결된 모든 소켓 연결 종료
    io.sockets.sockets.forEach((socket) => {
        if (socket.userId === userId.toString()) {
            socket.disconnect(true); // 강제 연결 종료
            console.log(`사용자 ${userId}의 소켓 연결을 강제 종료했습니다.`);
        }
    });
}

// 특정 스터디룸의 모든 사용자 소켓 연결 강제 종료
function disconnectAllUsersFromStudy(studyId) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    // 해당 스터디룸에 참가 중인 모든 사용자의 소켓 연결 종료
    io.sockets.sockets.forEach((socket) => {
        if (socket.currentStudyId === studyId.toString()) {
            socket.disconnect(true); // 강제 연결 종료
            console.log(`스터디룸 ${studyId}의 사용자 ${socket.userId}의 소켓 연결을 강제 종료했습니다.`);
        }
    });
}

module.exports = {
    setSocketIO,
    createStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    broadcastMessage,
    sendMessage,
    handleFileUploadComplete,
    getStudyRoomParticipants,
    broadcastToUser,
    removeUserFromRoom,
    disconnectUser,
    disconnectAllUsersFromStudy
};