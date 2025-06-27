import { io } from 'socket.io-client';

// 소켓 서버 URL
const SOCKET_SERVER_URL = 'http://localhost:7500';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentStudyId = null;
        this.currentUserId = null;
        this.eventListeners = new Map();
    }

    /**
     * 소켓 연결
     */
    connect(token) {
        if (this.socket && this.isConnected) {
            console.log('이미 소켓에 연결되어 있습니다.');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.socket = io(SOCKET_SERVER_URL, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    timeout: 10000,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000
                });

                // 연결 성공
                this.socket.on('connect', () => {
                    console.log('소켓 연결 성공:', this.socket.id);
                    this.isConnected = true;
                    resolve();
                });

                // 연결 확인
                this.socket.on('connection-established', (data) => {
                    console.log('연결 확인됨:', data);
                    this.currentUserId = data.user?.id;
                });

                // 연결 실패
                this.socket.on('connect_error', (error) => {
                    console.error('소켓 연결 실패:', error);
                    this.isConnected = false;
                    reject(error);
                });

                // 연결 끊김
                this.socket.on('disconnect', (reason) => {
                    console.log('소켓 연결 끊김:', reason);
                    this.isConnected = false;
                    this.currentStudyId = null;
                });

                // 에러 처리
                this.socket.on('error', (error) => {
                    console.error('소켓 에러:', error);
                });

                // 재연결 시도
                this.socket.on('reconnect', (attemptNumber) => {
                    console.log('소켓 재연결 성공:', attemptNumber);
                    this.isConnected = true;
                    
                    // 재연결 시 이전 스터디룸에 다시 참가
                    if (this.currentStudyId && this.currentUserId) {
                        this.joinStudy(this.currentStudyId, this.currentUserId);
                    }
                });

            } catch (error) {
                console.error('소켓 연결 중 예외 발생:', error);
                reject(error);
            }
        });
    }

    /**
     * 소켓 연결 해제
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentStudyId = null;
            this.currentUserId = null;
            console.log('소켓 연결 해제됨');
        }
    }

    /**
     * 스터디룸 참가
     */
    joinStudy(studyId, userId) {
        if (!this.socket || !this.isConnected) {
            console.error('소켓이 연결되어 있지 않습니다.');
            return false;
        }

        console.log(`스터디룸 참가: studyId=${studyId}, userId=${userId}`);
        
        this.currentStudyId = studyId;
        this.currentUserId = userId;
        
        this.socket.emit('join-study', { studyId, userId });
        return true;
    }

    /**
     * 스터디룸 퇴장
     */
    leaveStudy() {
        if (!this.socket || !this.isConnected) {
            return false;
        }

        console.log(`스터디룸 퇴장: studyId=${this.currentStudyId}`);
        
        this.socket.emit('leave-study');
        this.currentStudyId = null;
        return true;
    }

    /**
     * 메시지 전송
     */
    sendMessage(messageData) {
        if (!this.socket || !this.isConnected) {
            console.error('소켓이 연결되어 있지 않습니다.');
            return false;
        }

        if (!this.currentStudyId) {
            console.error('스터디룸에 참가되어 있지 않습니다.');
            return false;
        }

        const fullMessageData = {
            studyId: this.currentStudyId,
            userId: this.currentUserId,
            ...messageData
        };

        console.log('메시지 전송:', fullMessageData);
        this.socket.emit('send-message', fullMessageData);
        return true;
    }

    /**
     * 파일 업로드 완료 알림
     */
    notifyFileUploadComplete(fileInfo) {
        if (!this.socket || !this.isConnected || !this.currentStudyId) {
            return false;
        }

        this.socket.emit('file-upload-complete', {
            studyId: this.currentStudyId,
            userId: this.currentUserId,
            fileInfo
        });
        return true;
    }

    /**
     * 이벤트 리스너 등록
     */
    on(eventName, callback) {
        if (!this.socket) {
            console.error('소켓이 초기화되지 않았습니다.');
            return;
        }

        // 기존 리스너 제거
        if (this.eventListeners.has(eventName)) {
            this.socket.off(eventName, this.eventListeners.get(eventName));
        }

        // 새 리스너 등록
        this.socket.on(eventName, callback);
        this.eventListeners.set(eventName, callback);
    }

    /**
     * 이벤트 리스너 제거
     */
    off(eventName) {
        if (!this.socket) return;

        if (this.eventListeners.has(eventName)) {
            this.socket.off(eventName, this.eventListeners.get(eventName));
            this.eventListeners.delete(eventName);
        }
    }

    /**
     * 연결 상태 확인
     */
    isSocketConnected() {
        return this.isConnected && this.socket?.connected;
    }

    /**
     * 현재 스터디 ID 반환
     */
    getCurrentStudyId() {
        return this.currentStudyId;
    }

    /**
     * 현재 사용자 ID 반환
     */
    getCurrentUserId() {
        return this.currentUserId;
    }
}

// 싱글톤 인스턴스 생성
const socketService = new SocketService();

export default socketService; 