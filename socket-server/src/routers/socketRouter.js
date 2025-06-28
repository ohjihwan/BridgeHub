const { 
    handleJoinStudy, 
    handleSendMessage, 
    handleFileUploadComplete,
    handleGetSystemStatus,
    handleForceReconnect
} = require('../controllers/socketController');

// 소켓 이벤트 핸들러 설정
const setupSocketHandlers = (io) => {
    
    io.on('connection', (socket) => {
        console.log('🔗 SocketRouter - 클라이언트 연결:', socket.id, new Date().toISOString());

        // 스터디룸 참가
        socket.on('join-study', async (data) => {
            try {
                console.log('📥 SocketRouter - join-study 이벤트 수신:', data);
                const { studyId, userId } = data;
                if (!studyId || !userId) {
                    throw new Error('스터디 ID와 사용자 ID가 필요합니다.');
                }
                await handleJoinStudy(socket, studyId, userId);
            } catch (error) {
                console.error('❌ SocketRouter - 스터디룸 참가 처리 실패:', error);
                socket.emit('error', {
                    message: '스터디룸 참가에 실패했습니다.',
                    error: error.message
                });
            }
        });

        // 채팅방 참가
        socket.on('join-chat', async (data) => {
            console.log('💬 SocketRouter - join-chat 이벤트 수신:', data);
            try {
                const { studyId, userId } = data;
                if (!studyId || !userId) {
                    throw new Error('스터디 ID와 사용자 ID가 필요합니다.');
                }
                await handleJoinStudy(socket, studyId, userId);
            } catch (error) {
                console.error('❌ SocketRouter - 채팅방 참가 처리 실패:', error);
                socket.emit('error', {
                    message: '채팅방 참가에 실패했습니다.',
                    error: error.message
                });
            }
        });

        // 스터디룸 퇴장
        socket.on('leave-study', async () => {
            try {
                console.log('📤 SocketRouter - leave-study 이벤트 수신:', socket.userId);
                const studyId = socket.currentStudyId;
                if (studyId) {
                    socket.leave(studyId);
                    delete socket.currentStudyId;
                    
                    // 다른 참가자들에게 퇴장 알림
                    socket.to(studyId).emit('user-left', {
                        userId: socket.userId,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(`👋 사용자 ${socket.userId}가 스터디 ${studyId}에서 퇴장했습니다.`);
                }
            } catch (error) {
                console.error('❌ SocketRouter - 스터디룸 퇴장 처리 실패:', error);
                socket.emit('error', {
                    message: '스터디룸 퇴장에 실패했습니다.',
                    error: error.message
                });
            }
        });

        // 메시지 전송 (MongoDB 연동)
        socket.on('send-message', async (data) => {
            try {
                console.log('💬 SocketRouter - send-message 이벤트 수신:', {
                    studyId: data.studyId,
                    userId: data.userId,
                    messageLength: data.message?.length || 0,
                    timestamp: new Date().toISOString()
                });
                
                const { studyId, userId, message, fileType, fileUrl, fileName } = data;
                
                if (!studyId || !userId || !message) {
                    throw new Error('필수 정보가 누락되었습니다.');
                }

                await handleSendMessage(socket, data);
            } catch (error) {
                console.error('❌ SocketRouter - 메시지 전송 처리 실패:', error);
                socket.emit('error', {
                    message: '메시지 전송에 실패했습니다.',
                    error: error.message
                });
            }
        });

        // 파일 업로드 완료
        socket.on('file-upload-complete', async (data) => {
            try {
                console.log('📁 SocketRouter - file-upload-complete 이벤트 수신:', data);
                const { studyId, userId, fileInfo } = data;
                
                if (!studyId || !userId || !fileInfo) {
                    throw new Error('파일 업로드 정보가 누락되었습니다.');
                }

                await handleFileUploadComplete(socket, data);
            } catch (error) {
                console.error('❌ SocketRouter - 파일 업로드 완료 처리 실패:', error);
                socket.emit('error', {
                    message: '파일 업로드 완료 처리에 실패했습니다.',
                    error: error.message
                });
            }
        });

        // 시스템 상태 조회
        socket.on('get-system-status', () => {
            console.log('📊 SocketRouter - get-system-status 이벤트 수신');
            handleGetSystemStatus(socket);
        });

        // 강제 재연결
        socket.on('force-reconnect', () => {
            console.log('🔄 SocketRouter - force-reconnect 이벤트 수신');
            handleForceReconnect(socket);
        });

        // 연결 해제
        socket.on('disconnect', (reason) => {
            try {
                console.log('🔌 SocketRouter - 클라이언트 연결 해제:', socket.id, '이유:', reason, new Date().toISOString());
                
                // 스터디룸에서 퇴장 처리
                const studyId = socket.currentStudyId;
                if (studyId) {
                    socket.to(studyId).emit('user-disconnected', {
                        userId: socket.userId,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // 소켓 정보 정리
                delete socket.currentStudyId;
                delete socket.userId;
            } catch (error) {
                console.error('❌ SocketRouter - 연결 해제 처리 실패:', error);
            }
        });

        // 에러 이벤트 처리
        socket.on('error', (error) => {
            console.error('❌ SocketRouter - 소켓 에러:', error);
        });
    });
};

module.exports = setupSocketHandlers; 