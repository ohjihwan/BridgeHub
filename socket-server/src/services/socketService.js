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
function joinStudyRoom(socket, studyId, userId) {
    try {
        // 기존 스터디룸에서 나가기
        if (socket.currentStudyId) {
            leaveStudyRoom(socket);
        }

        // 새 스터디룸 참가
        socket.join(studyId);
        socket.currentStudyId = studyId;

        // 스터디룸 참가자 목록 업데이트
        if (!studyRooms.has(studyId)) {
            studyRooms.set(studyId, new Set());
        }
        studyRooms.get(studyId).add(userId);

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
        if (!studyId) return { success: true };

        socket.leave(studyId);
        delete socket.currentStudyId;

        // 스터디룸 참가자 목록 업데이트
        if (studyRooms.has(studyId)) {
            const participants = studyRooms.get(studyId);
            participants.delete(socket.userId);
            if (participants.size === 0) {
                studyRooms.delete(studyId);
            }
        }

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
    
    return Array.from(room).map(socket => ({
        id: socket.id,
        userId: socket.userId
    }));
};

module.exports = {
    createStudyRoom,
    joinStudyRoom,
    leaveStudyRoom,
    sendMessage,
    handleFileUploadComplete,
    getStudyRoomParticipants
}; 