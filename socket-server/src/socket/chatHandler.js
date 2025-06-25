const studyService = require('../services/studyService');

class ChatHandler {
    constructor(io) {
        this.io = io;
        this.rooms = new Map(); // 채팅방 정보 저장
        this.typingUsers = new Map(); // 타이핑 중인 사용자 관리 (studyId -> Set<userId>)
        this.typingTimeouts = new Map(); // 타이핑 타임아웃 관리 (socketId -> timeoutId)
        this.pendingNotifications = new Map(); // 미읽음 알림 저장 (userId -> Array<notification>)
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
                    // 이전 방에서 타이핑 상태 정리
                    this.clearTypingStatus(socket);
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

                // 현재 타이핑 중인 사용자 목록 전송
                const typingUsers = this.typingUsers.get(studyId);
                if (typingUsers && typingUsers.size > 0) {
                    socket.emit('typing-users-update', {
                        typingUsers: Array.from(typingUsers)
                    });
                }

                // 미읽음 알림 전송 (방장이 들어올 때)
                const pendingNotifications = this.pendingNotifications.get(userId);
                if (pendingNotifications && pendingNotifications.length > 0) {
                    socket.emit('pending-notifications', {
                        notifications: pendingNotifications
                    });
                    // 전송 후 삭제
                    this.pendingNotifications.delete(userId);
                }

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

            // 스터디 참가 신청 알림
            socket.on('study-join-request', async (data) => {
                try {
                    const { studyId, applicantId, applicantName, applicantProfileImage } = data;
                    console.log(`스터디 참가 신청 알림: studyId=${studyId}, applicant=${applicantName}`);

                    // 스터디 정보 조회 (방장 정보 포함)
                    const study = await studyService.getStudy(studyId);
                    if (!study) {
                        throw new Error('스터디를 찾을 수 없습니다.');
                    }

                    const bossId = study.bossId || study.createdBy; // 방장 ID
                    
                    // 알림 데이터 생성
                    const notification = {
                        type: 'join-request',
                        studyId: studyId,
                        studyTitle: study.title,
                        applicantId: applicantId,
                        applicantName: applicantName,
                        applicantProfileImage: applicantProfileImage || '/default-profile.png',
                        timestamp: new Date().toISOString(),
                        message: `${applicantName}님이 "${study.title}" 스터디 참가를 신청했습니다.`
                    };

                    // 방장이 현재 채팅방에 있는지 확인
                    const room = this.rooms.get(studyId);
                    let bossInRoom = false;
                    
                    if (room) {
                        for (const [socketId, participant] of room.participants) {
                            if (participant.userId === bossId) {
                                // 방장이 채팅방에 있으면 실시간 알림
                                this.io.to(socketId).emit('join-request-notification', notification);
                                bossInRoom = true;
                                console.log(`방장 ${bossId}에게 실시간 알림 전송됨`);
                                break;
                            }
                        }
                    }

                    // 방장이 채팅방에 없으면 미읽음 알림 저장
                    if (!bossInRoom) {
                        if (!this.pendingNotifications.has(bossId)) {
                            this.pendingNotifications.set(bossId, []);
                        }
                        this.pendingNotifications.get(bossId).push(notification);
                        console.log(`방장 ${bossId}의 미읽음 알림 저장됨`);
                    }

                    // 신청자에게 성공 응답
                    socket.emit('join-request-sent', {
                        success: true,
                        message: '참가 신청이 전송되었습니다.'
                    });

                } catch (error) {
                    console.error('스터디 참가 신청 알림 실패:', error);
                    socket.emit('join-request-error', {
                        message: error.message
                    });
                }
            });

            // 참가 신청 응답 (승인/거절)
            socket.on('study-join-response', async (data) => {
                try {
                    const { studyId, applicantId, response, bossId } = data; // response: 'approved' or 'rejected'
                    console.log(`스터디 참가 응답: studyId=${studyId}, applicantId=${applicantId}, response=${response}`);

                    // 스터디 정보 조회
                    const study = await studyService.getStudy(studyId);
                    if (!study) {
                        throw new Error('스터디를 찾을 수 없습니다.');
                    }

                    // 응답 메시지 생성
                    const responseNotification = {
                        type: 'join-response',
                        studyId: studyId,
                        studyTitle: study.title,
                        response: response,
                        timestamp: new Date().toISOString(),
                        message: response === 'approved' 
                            ? `"${study.title}" 스터디 참가가 승인되었습니다!`
                            : `"${study.title}" 스터디 참가가 거절되었습니다.`
                    };

                    // 신청자에게 알림 전송 (온라인이면 실시간, 오프라인이면 저장)
                    let applicantNotified = false;
                    
                    // 모든 방에서 신청자 찾기
                    for (const [roomId, room] of this.rooms) {
                        for (const [socketId, participant] of room.participants) {
                            if (participant.userId === applicantId) {
                                this.io.to(socketId).emit('join-response-notification', responseNotification);
                                applicantNotified = true;
                                console.log(`신청자 ${applicantId}에게 실시간 응답 알림 전송됨`);
                                break;
                            }
                        }
                        if (applicantNotified) break;
                    }

                    // 신청자가 온라인이 아니면 미읽음 알림 저장
                    if (!applicantNotified) {
                        if (!this.pendingNotifications.has(applicantId)) {
                            this.pendingNotifications.set(applicantId, []);
                        }
                        this.pendingNotifications.get(applicantId).push(responseNotification);
                        console.log(`신청자 ${applicantId}의 미읽음 응답 알림 저장됨`);
                    }

                    // 방장에게 성공 응답
                    socket.emit('join-response-sent', {
                        success: true,
                        message: '응답이 전송되었습니다.'
                    });

                } catch (error) {
                    console.error('스터디 참가 응답 실패:', error);
                    socket.emit('join-response-error', {
                        message: error.message
                    });
                }
            });

            // 메시지 전송
            socket.on('send-message', (data) => {
                const { studyId, userId, message, fileType, fileUrl, fileName } = data;
                console.log(`메시지 수신 - 방: ${studyId}, 사용자: ${userId}, 내용: ${message}`);
                
                // 메시지 전송 시 타이핑 상태 자동 해제
                this.stopTyping(socket, studyId, userId);
                
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

            // 타이핑 시작
            socket.on('typing-start', (data) => {
                const { studyId, userId } = data;
                console.log(`타이핑 시작 - 방: ${studyId}, 사용자: ${userId}`);
                
                this.startTyping(socket, studyId, userId);
            });

            // 타이핑 중지
            socket.on('typing-stop', (data) => {
                const { studyId, userId } = data;
                console.log(`타이핑 중지 - 방: ${studyId}, 사용자: ${userId}`);
                
                this.stopTyping(socket, studyId, userId);
            });

            // 연결 해제
            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제:', socket.id);
                
                // 타이핑 상태 정리
                this.clearTypingStatus(socket);
                
                // 참가 중인 모든 채팅방에서 사용자 제거
                this.rooms.forEach((room, studyId) => {
                    if (room.participants.has(socket.id)) {
                        const participant = room.participants.get(socket.id);
                        room.participants.delete(socket.id);
                        
                        if (room.participants.size === 0) {
                            this.rooms.delete(studyId);
                            // 채팅방이 비어있으면 타이핑 사용자 목록도 정리
                            this.typingUsers.delete(studyId);
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

    // 타이핑 시작 처리
    startTyping(socket, studyId, userId) {
        // 타이핑 사용자 목록 초기화
        if (!this.typingUsers.has(studyId)) {
            this.typingUsers.set(studyId, new Set());
        }

        const typingUsersInRoom = this.typingUsers.get(studyId);
        
        // 이미 타이핑 중이 아닌 경우에만 추가
        if (!typingUsersInRoom.has(userId)) {
            typingUsersInRoom.add(userId);
            
            // 다른 사용자들에게 타이핑 시작 알림
            socket.to(studyId).emit('typing-users-update', {
                typingUsers: Array.from(typingUsersInRoom)
            });
        }

        // 기존 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
        }

        // 3초 후 자동으로 타이핑 상태 해제
        const timeoutId = setTimeout(() => {
            this.stopTyping(socket, studyId, userId);
        }, 3000);

        this.typingTimeouts.set(socket.id, timeoutId);
    }

    // 타이핑 중지 처리
    stopTyping(socket, studyId, userId) {
        // 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
            this.typingTimeouts.delete(socket.id);
        }

        const typingUsersInRoom = this.typingUsers.get(studyId);
        if (typingUsersInRoom && typingUsersInRoom.has(userId)) {
            typingUsersInRoom.delete(userId);
            
            // 모든 사용자에게 타이핑 상태 업데이트 알림
            this.io.to(studyId).emit('typing-users-update', {
                typingUsers: Array.from(typingUsersInRoom)
            });

            // 타이핑 사용자가 없으면 Set 정리
            if (typingUsersInRoom.size === 0) {
                this.typingUsers.delete(studyId);
            }
        }
    }

    // 소켓 연결 해제 시 타이핑 상태 정리
    clearTypingStatus(socket) {
        // 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
            this.typingTimeouts.delete(socket.id);
        }

        // 모든 채팅방에서 해당 사용자의 타이핑 상태 제거
        if (socket.currentRoom && socket.userId) {
            this.stopTyping(socket, socket.currentRoom, socket.userId);
        }
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