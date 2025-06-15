const socketService = require('../services/socketService');

// 소켓 이벤트 핸들러 설정
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('새로운 클라이언트 연결:', socket.id);

        // 스터디룸 참가
        socket.on('join-study', (data) => {
            const { studyId, userId } = data;
            const result = socketService.joinStudyRoom(socket, studyId, userId);
            
            if (result.success) {
                socket.emit('join-study-success', result.data);
                socket.to(studyId).emit('user-joined', {
                    userId,
                    participants: result.data.participants
                });
            } else {
                socket.emit('join-study-error', result.error);
            }
        });

        // 스터디룸 퇴장
        socket.on('leave-study', () => {
            const result = socketService.leaveStudyRoom(socket);
            
            if (result.success) {
                socket.emit('leave-study-success');
                if (socket.currentStudyId) {
                    socket.to(socket.currentStudyId).emit('user-left', {
                        userId: socket.userId
                    });
                }
            } else {
                socket.emit('leave-study-error', result.error);
            }
        });

        // 메시지 전송
        socket.on('send-message', (data) => {
            const result = socketService.sendMessage(socket, data);
            
            if (result.success) {
                socket.to(data.studyId).emit('new-message', result.data);
            } else {
                socket.emit('message-error', result.error);
            }
        });

        // 파일 업로드 완료
        socket.on('file-upload-complete', (data) => {
            const result = socketService.handleFileUploadComplete(socket, data);
            
            if (result.success) {
                socket.to(data.studyId).emit('new-file', result.data);
            } else {
                socket.emit('file-error', result.error);
            }
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log('클라이언트 연결 해제:', socket.id);
            const result = socketService.leaveStudyRoom(socket);
            if (result.success && socket.currentStudyId) {
                socket.to(socket.currentStudyId).emit('user-left', {
                    userId: socket.userId
                });
            }
        });
    });
};

module.exports = setupSocketHandlers; 