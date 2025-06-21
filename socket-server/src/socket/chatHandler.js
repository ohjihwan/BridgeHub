const studyService = require('../services/studyService');

class ChatHandler {
    constructor(io) {
        this.io = io;
        this.rooms = new Map(); // 채팅방 정보 저장
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('클라이언트 연결됨:', socket.id);

            // 채팅방 참가
            socket.on('join-chat', async (data) => {
                try {
                const { studyId, userId } = data;
                    console.log(`사용자 ${userId}가 채팅방 ${studyId}에 참가 시도`);

                    // 스터디 정보 조회
                    const study = await studyService.getStudy(studyId);
                    if (!study) {
                        throw new Error('스터디를 찾을 수 없습니다.');
                    }

                    // 현재 참가자 수 확인
                    const room = this.rooms.get(studyId);
                    const currentParticipants = room ? room.participants.size : 0;

                    // 정원 체크
                    if (currentParticipants >= study.capacity) {
                        throw new Error('채팅방 정원이 초과되었습니다.');
                    }
                
                // 이전 방에서 나가기
                if (socket.currentRoom) {
                    socket.leave(socket.currentRoom);
                }
                
                // 새 방 참가
                socket.join(studyId);
                socket.currentRoom = studyId;
                    socket.userId = userId;
                
                // 채팅방 정보 초기화
                if (!this.rooms.has(studyId)) {
                    this.rooms.set(studyId, {
                        messages: [],
                            participants: new Map(),
                            capacity: study.capacity
                    });
                }
                
                // 참가자 정보 저장
                this.rooms.get(studyId).participants.set(socket.id, {
                    userId: userId,
                    socketId: socket.id
                });

                // 채팅 기록 전송
                    const currentRoom = this.rooms.get(studyId);
                    socket.emit('chat-history', currentRoom.messages);

                // 참여자 수 업데이트
                this.io.to(studyId).emit('member-count', {
                        count: currentRoom.participants.size,
                        capacity: study.capacity
                });

                // 입장 메시지 전송
                this.io.to(studyId).emit('new-message', {
                    userId: '시스템',
                    content: `${userId}님이 입장하셨습니다.`,
                    timestamp: new Date().toISOString()
                });

                } catch (error) {
                    console.error('채팅방 참가 실패:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            // 메시지 전송
            socket.on('send-message', (data) => {
                const { studyId, userId, message, fileType, fileUrl, fileName } = data;
                console.log(`메시지 수신 - 방: ${studyId}, 사용자: ${userId}, 내용: ${message}`);
                
                const timestamp = new Date().toISOString();
                const room = this.rooms.get(studyId);
                
                if (room) {
                    // 메시지 저장
                    room.messages.push({
                        userId,
                        content: message,
                        timestamp,
                        fileType,
                        fileUrl,
                        fileName
                    });

                    // 같은 방의 모든 클라이언트에게 메시지 전송
                    this.io.to(studyId).emit('new-message', {
                        userId,
                        content: message,
                        timestamp,
                        fileType,
                        fileUrl,
                        fileName
                    });
                } else {
                    console.error(`채팅방을 찾을 수 없음: ${studyId}`);
                }
            });

            // 연결 해제
            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제:', socket.id);
                
                // 참가 중인 모든 채팅방에서 사용자 제거
                this.rooms.forEach((room, studyId) => {
                    if (room.participants.has(socket.id)) {
                        const participant = room.participants.get(socket.id);
                        room.participants.delete(socket.id);
                        
                        if (room.participants.size === 0) {
                            this.rooms.delete(studyId);
                        } else {
                            // 참여자 수 업데이트
                            this.io.to(studyId).emit('member-count', {
                                count: room.participants.size,
                                capacity: 10
                            });

                            // 퇴장 메시지 전송
                            this.io.to(studyId).emit('new-message', {
                                userId: '시스템',
                                content: `${participant.userId}님이 퇴장하셨습니다.`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            });
        });
    }
}

const handleJoinStudy = (socket, studyId, userId) => {
    console.log(`사용자 ${userId}가 스터디 ${studyId}에 참가했습니다.`);
    socket.join(studyId);
};

const handleLeaveStudy = (socket, studyId) => {
    console.log(`사용자가 스터디 ${studyId}에서 퇴장했습니다.`);
    socket.leave(studyId);
};

const handleSendMessage = (socket, data) => {
    const { studyId, userId, message, fileType, fileUrl, fileName } = data;
    console.log('메시지 수신:', { studyId, userId, message, fileType, fileUrl, fileName });

    // 스터디룸의 모든 클라이언트에게 메시지 브로드캐스트
    socket.to(studyId).emit('receive-message', {
        userId,
        message,
        fileType,
        fileUrl,
        fileName,
        timestamp: new Date().toISOString()
    });
};

const handleFileUploadComplete = (socket, data) => {
    const { studyId, userId, fileInfo } = data;
    console.log('파일 업로드 완료:', { studyId, userId, fileInfo });

    // 스터디룸의 모든 클라이언트에게 파일 업로드 알림 브로드캐스트
    socket.to(studyId).emit('file-upload-complete', {
        userId,
        fileInfo,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    handleJoinStudy,
    handleLeaveStudy,
    handleSendMessage,
    handleFileUploadComplete
}; 