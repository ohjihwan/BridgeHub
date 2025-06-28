import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

/**
 * 소켓 연결을 관리하는 커스텀 훅
 */
export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const reconnectTimeoutRef = useRef(null);

    /**
     * 소켓 연결
     */
    const connect = useCallback(async (token) => {
        if (isConnecting || isConnected) {
            return;
        }

        setIsConnecting(true);
        setConnectionError(null);

        try {
            await socketService.connect(token);
            setIsConnected(true);
            console.log('소켓 연결 성공');
        } catch (error) {
            console.error('소켓 연결 실패:', error);
            setConnectionError(error.message);
            
            // 자동 재연결 시도 (5초 후)
            reconnectTimeoutRef.current = setTimeout(() => {
                connect(token);
            }, 5000);
        } finally {
            setIsConnecting(false);
        }
    }, [isConnecting, isConnected]);

    /**
     * 소켓 연결 해제
     */
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        socketService.disconnect();
        setIsConnected(false);
        setConnectionError(null);
        setIsConnecting(false);
    }, []);

    /**
     * 자동 연결 (토큰이 있을 때)
     */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isConnected && !isConnecting) {
            connect(token);
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect, isConnected, isConnecting]);

    /**
     * 컴포넌트 언마운트 시 연결 해제
     */
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isConnecting,
        connectionError,
        connect,
        disconnect,
        socketService
    };
};

/**
 * 스터디룸 소켓 이벤트를 관리하는 커스텀 훅
 */
export const useStudySocket = (studyId, userId) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const { isConnected, socketService } = useSocket();

    /**
     * 스터디룸 참가
     */
    const joinStudy = useCallback(() => {
        if (!isConnected || !studyId || !userId) {
            return false;
        }

        const success = socketService.joinStudy(studyId, userId);
        if (success) {
            setIsJoined(true);
        }
        return success;
    }, [isConnected, studyId, userId, socketService]);

    /**
     * 스터디룸 퇴장
     */
    const leaveStudy = useCallback(() => {
        const success = socketService.leaveStudy();
        if (success) {
            setIsJoined(false);
        }
        return success;
    }, [socketService]);

    /**
     * 메시지 전송
     */
    const sendMessage = useCallback((messageData) => {
        return socketService.sendMessage(messageData);
    }, [socketService]);

    /**
     * 타이핑 시작
     */
    const startTyping = useCallback(() => {
        if (!isConnected || !isJoined || !studyId || !userId) return;
        socketService.startTyping();
    }, [isConnected, isJoined, studyId, userId, socketService]);

    /**
     * 타이핑 중지
     */
    const stopTyping = useCallback(() => {
        if (!isConnected || !isJoined || !studyId || !userId) return;
        socketService.stopTyping();
    }, [isConnected, isJoined, studyId, userId, socketService]);

    /**
     * 소켓 이벤트 리스너 설정
     */
    useEffect(() => {
        if (!isConnected) return;

        // 메시지 수신
        socketService.on('new-message', (messageData) => {
            setMessages(prev => [...prev, messageData]);
        });

        // 사용자 참가
        socketService.on('user-joined', (userData) => {
            setOnlineUsers(prev => {
                const exists = prev.find(user => user.userId === userData.userId);
                if (!exists) {
                    return [...prev, userData];
                }
                return prev;
            });
        });

        // 사용자 퇴장
        socketService.on('user-left', (userData) => {
            setOnlineUsers(prev => prev.filter(user => user.userId !== userData.userId));
        });

        // 온라인 사용자 목록 업데이트
        socketService.on('online-users', (users) => {
            setOnlineUsers(users);
        });

        // 파일 업로드 완료
        socketService.on('file-uploaded', (fileData) => {
            setMessages(prev => [...prev, {
                type: 'file',
                ...fileData,
                timestamp: new Date().toISOString()
            }]);
        });

        // 타이핑 사용자 업데이트
        socketService.on('typing-users-update', (data) => {
            setTypingUsers(data.typingUsers || []);
        });

        // 에러 처리
        socketService.on('error', (error) => {
            console.error('스터디 소켓 에러:', error);
        });

        // 자동 참가 (연결되면 바로 참가)
        if (studyId && userId) {
            joinStudy();
        }

        // 클린업
        return () => {
            socketService.off('new-message');
            socketService.off('user-joined');
            socketService.off('user-left');
            socketService.off('online-users');
            socketService.off('file-uploaded');
            socketService.off('typing-users-update');
            socketService.off('error');
        };
    }, [isConnected, studyId, userId, joinStudy, socketService]);

    /**
     * 컴포넌트 언마운트 시 스터디룸 퇴장
     */
    useEffect(() => {
        return () => {
            if (isJoined) {
                leaveStudy();
            }
        };
    }, [isJoined, leaveStudy]);

    return {
        messages,
        onlineUsers,
        typingUsers,
        isJoined,
        joinStudy,
        leaveStudy,
        sendMessage,
        startTyping,
        stopTyping,
        isConnected
    };
};

export default useSocket; 