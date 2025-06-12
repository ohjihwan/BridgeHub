const socketController = require('../controllers/socketController');

// 소켓 이벤트 핸들러 설정
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('새로운 클라이언트 연결:', socket.id);

        // 스터디룸 참가
        socket.on('join-study', (data) => {
            const { studyId, userId } = data;
            socketController.handleJoinStudy(socket, studyId, userId);
        });

        // 스터디룸 퇴장
        socket.on('leave-study', (data) => {
            const { studyId } = data;
            socketController.handleLeaveStudy(socket, studyId);
        });

        // 메시지 전송
        socket.on('send-message', (data) => {
            socketController.handleSendMessage(socket, data);
        });

        // 파일 업로드 완료
        socket.on('file-upload-complete', (data) => {
            socketController.handleFileUploadComplete(socket, data);
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log('클라이언트 연결 해제:', socket.id);
        });
    });
};

module.exports = setupSocketHandlers; 