const socketService = require('../services/socketService');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:7100/api';

// 스터디룸 참가
const handleJoinStudy = (socket, studyId, userId) => {
    try {
        // 소켓에 사용자 ID 저장
        socket.userId = userId;
        
        // 스터디룸 참가
        const room = socketService.joinStudyRoom(studyId, socket);
        
        // 참가자 목록 조회
        const participants = socketService.getStudyRoomParticipants(studyId);
        
        // 참가자들에게 새 참가자 알림
        socketService.broadcastMessage(studyId, {
            type: 'system',
            content: `${userId}님이 참가했습니다.`,
            participants
        });
        
        console.log(`사용자 ${userId}가 스터디 ${studyId}에 참가했습니다.`);
    } catch (error) {
        console.error('스터디룸 참가 실패:', error);
        socket.emit('error', {
            message: '스터디룸 참가에 실패했습니다.'
        });
    }
};

// 스터디룸 퇴장
const handleLeaveStudy = (socket, studyId) => {
    try {
        const userId = socket.userId;
        
        // 스터디룸 퇴장
        socketService.leaveStudyRoom(studyId, socket);
        
        // 참가자 목록 조회
        const participants = socketService.getStudyRoomParticipants(studyId);
        
        // 참가자들에게 퇴장 알림
        socketService.broadcastMessage(studyId, {
            type: 'system',
            content: `${userId}님이 퇴장했습니다.`,
            participants
        });
        
        console.log(`사용자 ${userId}가 스터디 ${studyId}에서 퇴장했습니다.`);
    } catch (error) {
        console.error('스터디룸 퇴장 실패:', error);
        socket.emit('error', {
            message: '스터디룸 퇴장에 실패했습니다.'
        });
    }
};

// 메시지 전송
const handleSendMessage = async (socket, data) => {
    try {
        const { studyId, userId, message, fileType, fileUrl, fileName } = data;
        
        // 파일이 있는 경우 API 서버에 파일 정보 저장
        if (fileType && fileUrl) {
            try {
                await axios.post(`${API_BASE_URL}/study/${studyId}/files`, {
                    fileName,
                    fileUrl,
                    fileType,
                    uploadedBy: userId
                });
            } catch (error) {
                console.error('파일 정보 저장 실패:', error);
            }
        }
        
        // 메시지 브로드캐스트
        socketService.broadcastMessage(studyId, {
            type: 'message',
            userId,
            content: message,
            fileType,
            fileUrl,
            fileName,
            timestamp: new Date().toISOString()
        });
        
        console.log(`스터디 ${studyId}에서 메시지 전송: ${message}`);
    } catch (error) {
        console.error('메시지 전송 실패:', error);
        socket.emit('error', {
            message: '메시지 전송에 실패했습니다.'
        });
    }
};

// 파일 업로드 완료 알림
const handleFileUploadComplete = async (socket, data) => {
    try {
        const { studyId, userId, fileInfo } = data;
        
        // 파일 정보를 API 서버에 저장
        const response = await axios.post(`${API_BASE_URL}/study/${studyId}/files`, {
            ...fileInfo,
            uploadedBy: userId
        });
        
        // 파일 업로드 완료 메시지 브로드캐스트
        socketService.broadcastMessage(studyId, {
            type: 'file',
            userId,
            content: `${userId}님이 파일을 공유했습니다.`,
            fileInfo: response.data,
            timestamp: new Date().toISOString()
        });
        
        console.log(`스터디 ${studyId}에서 파일 업로드 완료: ${fileInfo.fileName}`);
    } catch (error) {
        console.error('파일 업로드 완료 처리 실패:', error);
        socket.emit('error', {
            message: '파일 업로드 완료 처리에 실패했습니다.'
        });
    }
};

module.exports = {
    handleJoinStudy,
    handleLeaveStudy,
    handleSendMessage,
    handleFileUploadComplete
}; 