// 임시 데이터 저장소 (나중에 데이터베이스로 대체)
const studyRooms = new Map();
let io = null; // Socket.IO 인스턴스를 저장

// Socket.IO 인스턴스 설정
const setSocketIO = (socketIO) => {
    io = socketIO;
};

// Socket.IO 인스턴스 반환
function getIO() {
    return io;
}

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
        socket.userId = String(userId);

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

// 기존 소켓들의 userId를 문자열로 강제 업데이트
function normalizeSocketUserIds() {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    console.log('🔄 소켓 userId 정규화 시작');
    let updatedCount = 0;

    io.sockets.sockets.forEach((socket) => {
        if (socket.userId && typeof socket.userId !== 'string') {
            const oldUserId = socket.userId;
            socket.userId = String(socket.userId);
            socket.memberId = String(socket.userId);
            updatedCount++;
            console.log(`🔄 소켓 ${socket.id} userId 정규화: ${oldUserId} (${typeof oldUserId}) → ${socket.userId} (${typeof socket.userId})`);
        }
    });

    console.log(`✅ 소켓 userId 정규화 완료: ${updatedCount}개 업데이트됨`);
}

// 특정 사용자에게 메시지 전송
function broadcastToUser(userId, message) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    // 먼저 기존 소켓들의 userId를 정규화
    normalizeSocketUserIds();

    console.log(`📤 사용자 ${userId}에게 메시지 전송 시작:`, message);
    console.log(`🔍 타입 정보: userId=${userId} (${typeof userId})`);
    
    let sentCount = 0;
    // 해당 사용자가 연결된 모든 소켓에 메시지 전송
    io.sockets.sockets.forEach((socket) => {
        // 모든 가능한 사용자 ID 필드 확인 (숫자와 문자열 모두 처리)
        const possibleUserIds = [
            socket.userId,
            socket.memberId,
            socket.user?.userId,
            socket.user?.memberId,
            socket.user?.username
        ].filter(id => id != null);
        
        const targetUserId = userId;
        
        // 숫자와 문자열 모두 비교
        const isMatch = possibleUserIds.some(id => {
            const match = id == targetUserId; // 느슨한 비교 사용
            if (match) {
                console.log(`✅ 매치 발견: ${id} == ${targetUserId} (타입: ${typeof id} == ${typeof targetUserId})`);
            }
            return match;
        });
        
        console.log(`🔍 소켓 ${socket.id} 사용자 ID 확인:`, {
            socketUserId: socket.userId,
            socketMemberId: socket.memberId,
            possibleUserIds,
            targetUserId,
            isMatch
        });
        
        if (isMatch) {
            try {
                console.log(`📤 소켓 ${socket.id}에 메시지 전송 중... (userId: ${targetUserId})`);
                socket.emit('system-message', message);
                sentCount++;
                console.log(`✅ 소켓 ${socket.id}에 메시지 전송 완료`);
            } catch (error) {
                console.error(`❌ 소켓 ${socket.id}에 메시지 전송 실패:`, error);
            }
        }
    });
    
    if (sentCount === 0) {
        console.warn(`⚠️ 사용자 ${userId}의 활성 소켓 연결을 찾을 수 없습니다.`);
        console.log('🔍 현재 연결된 모든 소켓:', Array.from(io.sockets.sockets.values()).map(s => ({
            socketId: s.id,
            userId: s.userId,
            userIdType: typeof s.userId,
            memberId: s.memberId,
            memberIdType: typeof s.memberId,
            userObject: s.user,
            currentStudyId: s.currentStudyId
        })));
    } else {
        console.log(`✅ 사용자 ${userId}에게 총 ${sentCount}개의 소켓에 메시지 전송 완료`);
    }
}

// 채팅방에서 특정 사용자 제거
function removeUserFromRoom(roomId, userId) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    console.log(`🚪 채팅방 ${roomId}에서 사용자 ${userId} 제거 시작`);
    let removedCount = 0;

    // 해당 사용자가 연결된 모든 소켓에서 채팅방 제거
    io.sockets.sockets.forEach((socket) => {
        // 타입 안전한 비교: 양쪽 모두 문자열로 변환
        const socketUserId = String(socket.userId || '');
        const targetUserId = String(userId || '');
        const socketStudyId = String(socket.currentStudyId || '');
        const targetRoomId = String(roomId || '');
        
        if (socketUserId === targetUserId && socketStudyId === targetRoomId) {
            try {
                socket.leave(targetRoomId);
                socket.currentStudyId = null;
                removedCount++;
                console.log(`✅ 사용자 ${userId}를 채팅방 ${roomId}에서 제거했습니다. (${removedCount}번째)`);
            } catch (error) {
                console.error(`❌ 사용자 ${userId}를 채팅방 ${roomId}에서 제거 중 오류:`, error);
            }
        }
    });
    
    console.log(`📊 채팅방 제거 결과: 제거된 소켓 ${removedCount}개`);
}

// 특정 사용자의 소켓 연결 강제 종료 (완전히 새로 작성)
function disconnectUser(userId) {
    if (!io) {
        console.warn('Socket.IO 인스턴스가 초기화되지 않았습니다.');
        return;
    }

    console.log(`🔌 사용자 ${userId}의 소켓 연결 강제 종료 시작`);
    console.log(`🔍 타입 정보: userId=${userId} (${typeof userId})`);
    
    let disconnectedCount = 0;
    let foundSockets = 0;
    
    // 현재 연결된 모든 소켓을 직접 확인
    const allSockets = Array.from(io.sockets.sockets.values());
    console.log(`🔍 총 ${allSockets.length}개의 소켓 연결 확인 중...`);
    
    allSockets.forEach((socket) => {
        console.log(`🔍 소켓 ${socket.id} 상세 정보:`, {
            userId: socket.userId,
            userIdType: typeof socket.userId,
            memberId: socket.memberId,
            memberIdType: typeof socket.memberId,
            userObject: socket.user,
            currentStudyId: socket.currentStudyId
        });
        
        // 모든 가능한 ID 값들을 수집
        const allIds = [
            socket.userId,
            socket.memberId,
            socket.user?.userId,
            socket.user?.memberId,
            socket.user?.username
        ].filter(id => id != null);
        
        console.log(`🔍 소켓 ${socket.id}의 모든 ID:`, allIds);
        
        // 타입에 관계없이 모든 비교 시도
        let isMatch = false;
        for (const id of allIds) {
            // 엄격한 비교
            if (id === userId) {
                console.log(`✅ 엄격한 비교 매치: ${id} === ${userId}`);
                isMatch = true;
                break;
            }
            // 느슨한 비교
            if (id == userId) {
                console.log(`✅ 느슨한 비교 매치: ${id} == ${userId}`);
                isMatch = true;
                break;
            }
            // 문자열 변환 후 비교
            if (String(id) === String(userId)) {
                console.log(`✅ 문자열 변환 매치: "${id}" === "${userId}"`);
                isMatch = true;
                break;
            }
        }
        
        if (isMatch) {
            foundSockets++;
            try {
                console.log(`🔌 소켓 ${socket.id} 강제 종료 시작 (사용자: ${userId})`);
                
                // 강퇴 알림 전송
                socket.emit('kicked', {
                    type: 'kicked',
                    message: '채팅방에서 강퇴되었습니다.',
                    timestamp: new Date().toISOString()
                });
                console.log(`📤 소켓 ${socket.id}에 강퇴 알림 전송 완료`);
                
                // 즉시 연결 종료
                socket.disconnect(true);
                disconnectedCount++;
                console.log(`✅ 소켓 ${socket.id} 강제 종료 완료 (${disconnectedCount}번째)`);
            } catch (error) {
                console.error(`❌ 소켓 ${socket.id} 강제 종료 중 오류:`, error);
            }
        } else {
            console.log(`❌ 소켓 ${socket.id}는 매치되지 않음`);
        }
    });
    
    console.log(`📊 강제 종료 결과: 찾은 소켓 ${foundSockets}개, 성공 ${disconnectedCount}개`);
    
    if (foundSockets === 0) {
        console.error(`❌ 사용자 ${userId}의 소켓 연결을 찾을 수 없습니다!`);
        console.log('🔍 모든 소켓 정보:', allSockets.map(s => ({
            socketId: s.id,
            userId: s.userId,
            userIdType: typeof s.userId,
            memberId: s.memberId,
            memberIdType: typeof s.memberId,
            userObject: s.user,
            currentStudyId: s.currentStudyId
        })));
    } else if (disconnectedCount === 0) {
        console.error(`❌ 사용자 ${userId}의 소켓 연결 강제 종료에 실패했습니다.`);
    } else {
        console.log(`✅ 사용자 ${userId}의 총 ${disconnectedCount}개의 소켓 연결이 강제 종료되었습니다.`);
    }
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

// 모든 사용자에게 스터디룸 목록 업데이트 알림 전송
function broadcastStudyRoomUpdate(action, studyRoomData) {
    try {
        if (!io) {
            console.error('Socket.IO 인스턴스가 설정되지 않았습니다.');
            return { success: false, error: 'Socket.IO 인스턴스가 없습니다.' };
        }

        // 모든 연결된 클라이언트에게 스터디룸 업데이트 알림 전송
        io.emit('study-room-update', {
            action: action, // 'created', 'updated', 'deleted'
            studyRoom: studyRoomData,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📢 스터디룸 ${action} 알림 브로드캐스트:`, studyRoomData?.title || studyRoomData?.studyRoomId);
        
        return { success: true };
    } catch (error) {
        console.error('스터디룸 업데이트 브로드캐스트 에러:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    setSocketIO,
    getIO,
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
    disconnectAllUsersFromStudy,
    broadcastStudyRoomUpdate
};