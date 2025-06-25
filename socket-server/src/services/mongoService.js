/**
 * MongoDB 서비스
 * 실시간 메시지 및 채팅 데이터 관리
 */

const mongoDBManager = require('../config/mongodb');

class MongoService {
    constructor() {
        this.messagesCollection = null;
        this.chatSessionsCollection = null;
        this.studyRoomStatusCollection = null;
        this.userStatusCollection = null;
        this.systemLogsCollection = null;
    }

    /**
     * 서비스 초기화
     */
    async initialize() {
        try {
            await mongoDBManager.connect();
            
            // 컬렉션 참조 설정
            this.messagesCollection = mongoDBManager.getCollection('messages');
            this.chatSessionsCollection = mongoDBManager.getCollection('chat_sessions');
            this.studyRoomStatusCollection = mongoDBManager.getCollection('study_room_status');
            this.userStatusCollection = mongoDBManager.getCollection('user_status');
            this.systemLogsCollection = mongoDBManager.getCollection('system_logs');
            
            console.log('✅ MongoDB 서비스 초기화 완료');
        } catch (error) {
            console.error('❌ MongoDB 서비스 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 메시지 저장
     */
    async saveMessage(messageData) {
        try {
            const message = {
                studyId: messageData.studyId,
                senderId: messageData.senderId,
                senderName: messageData.senderName,
                senderNickname: messageData.senderNickname,
                content: messageData.content,
                messageType: messageData.messageType || 'TEXT',
                fileInfo: messageData.fileInfo || null,
                timestamp: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            };

            const result = await this.messagesCollection.insertOne(message);
            
            // 스터디룸 상태 업데이트
            await this.updateStudyRoomLastMessage(messageData.studyId, {
                content: messageData.content,
                senderId: messageData.senderId,
                senderName: messageData.senderName,
                timestamp: new Date()
            });

            // 시스템 로그 기록
            await this.logSystemEvent('INFO', 'MESSAGE', messageData.studyId, messageData.senderId, '메시지 전송', { messageId: result.insertedId });

            return result.insertedId;
        } catch (error) {
            console.error('메시지 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 메시지 조회 (최근 N개)
     */
    async getRecentMessages(studyId, limit = 50) {
        try {
            const messages = await this.messagesCollection
                .find({ 
                    studyId: studyId, 
                    isDeleted: false 
                })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();

            return messages.reverse(); // 시간순 정렬
        } catch (error) {
            console.error('메시지 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 채팅 세션 생성/업데이트
     */
    async updateChatSession(sessionData) {
        try {
            const session = {
                studyId: sessionData.studyId,
                userId: sessionData.userId,
                userName: sessionData.userName,
                userNickname: sessionData.userNickname,
                status: sessionData.status || 'ACTIVE',
                joinedAt: sessionData.joinedAt || new Date(),
                lastActivity: new Date(),
                lastMessageAt: sessionData.lastMessageAt || null,
                messageCount: sessionData.messageCount || 0,
                socketId: sessionData.socketId,
                userAgent: sessionData.userAgent,
                ipAddress: sessionData.ipAddress,
                createdAt: sessionData.createdAt || new Date(),
                updatedAt: new Date()
            };

            const result = await this.chatSessionsCollection.updateOne(
                { studyId: sessionData.studyId, userId: sessionData.userId },
                { $set: session },
                { upsert: true }
            );

            // 사용자 상태 업데이트
            await this.updateUserStatus({
                userId: sessionData.userId,
                userName: sessionData.userName,
                userNickname: sessionData.userNickname,
                status: 'ONLINE',
                currentStudyId: sessionData.studyId,
                socketId: sessionData.socketId,
                userAgent: sessionData.userAgent,
                ipAddress: sessionData.ipAddress
            });

            return result;
        } catch (error) {
            console.error('채팅 세션 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 상태 업데이트
     */
    async updateStudyRoomStatus(studyId, studyData) {
        try {
            const status = {
                studyId: studyId,
                studyTitle: studyData.studyTitle,
                currentMembers: studyData.currentMembers || [],
                memberCount: studyData.memberCount || 0,
                lastMessage: studyData.lastMessage || null,
                lastActivity: new Date(),
                isActive: studyData.isActive !== false,
                createdAt: studyData.createdAt || new Date(),
                updatedAt: new Date()
            };

            const result = await this.studyRoomStatusCollection.updateOne(
                { studyId: studyId },
                { $set: status },
                { upsert: true }
            );

            return result;
        } catch (error) {
            console.error('스터디룸 상태 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 마지막 메시지 업데이트
     */
    async updateStudyRoomLastMessage(studyId, lastMessage) {
        try {
            await this.studyRoomStatusCollection.updateOne(
                { studyId: studyId },
                { 
                    $set: { 
                        lastMessage: lastMessage,
                        lastActivity: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );
        } catch (error) {
            console.error('스터디룸 마지막 메시지 업데이트 실패:', error);
        }
    }

    /**
     * 사용자 상태 업데이트
     */
    async updateUserStatus(userData) {
        try {
            const status = {
                userId: userData.userId,
                userName: userData.userName,
                userNickname: userData.userNickname,
                status: userData.status || 'ONLINE',
                currentStudyId: userData.currentStudyId,
                socketId: userData.socketId,
                lastSeen: new Date(),
                lastActivity: new Date(),
                deviceInfo: {
                    userAgent: userData.userAgent,
                    ipAddress: userData.ipAddress,
                    platform: userData.platform
                },
                createdAt: userData.createdAt || new Date(),
                updatedAt: new Date()
            };

            const result = await this.userStatusCollection.updateOne(
                { userId: userData.userId },
                { $set: status },
                { upsert: true }
            );

            return result;
        } catch (error) {
            console.error('사용자 상태 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 사용자 오프라인 처리
     */
    async setUserOffline(userId) {
        try {
            await this.userStatusCollection.updateOne(
                { userId: userId },
                { 
                    $set: { 
                        status: 'OFFLINE',
                        lastSeen: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );

            // 채팅 세션 비활성화
            await this.chatSessionsCollection.updateMany(
                { userId: userId },
                { 
                    $set: { 
                        status: 'INACTIVE',
                        lastActivity: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );
        } catch (error) {
            console.error('사용자 오프라인 처리 실패:', error);
        }
    }

    /**
     * 시스템 로그 기록
     */
    async logSystemEvent(level, category, studyId, userId, message, details = {}) {
        try {
            const log = {
                level: level,
                category: category,
                studyId: studyId,
                userId: userId,
                message: message,
                details: details,
                timestamp: new Date(),
                createdAt: new Date()
            };

            await this.systemLogsCollection.insertOne(log);
        } catch (error) {
            console.error('시스템 로그 기록 실패:', error);
        }
    }

    /**
     * 스터디룸 참가자 목록 조회
     */
    async getStudyRoomMembers(studyId) {
        try {
            const sessions = await this.chatSessionsCollection
                .find({ 
                    studyId: studyId, 
                    status: 'ACTIVE' 
                })
                .sort({ joinedAt: 1 })
                .toArray();

            return sessions;
        } catch (error) {
            console.error('스터디룸 참가자 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 사용자별 메시지 통계
     */
    async getUserMessageStats(userId, studyId) {
        try {
            const stats = await this.messagesCollection.aggregate([
                {
                    $match: {
                        senderId: userId,
                        studyId: studyId,
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: 1 },
                        lastMessageAt: { $max: '$timestamp' }
                    }
                }
            ]).toArray();

            return stats[0] || { totalMessages: 0, lastMessageAt: null };
        } catch (error) {
            console.error('사용자 메시지 통계 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 통계
     */
    async getStudyRoomStats(studyId) {
        try {
            const stats = await this.messagesCollection.aggregate([
                {
                    $match: {
                        studyId: studyId,
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$senderId' },
                        lastMessageAt: { $max: '$timestamp' }
                    }
                },
                {
                    $project: {
                        totalMessages: 1,
                        uniqueUserCount: { $size: '$uniqueUsers' },
                        lastMessageAt: 1
                    }
                }
            ]).toArray();

            return stats[0] || { totalMessages: 0, uniqueUserCount: 0, lastMessageAt: null };
        } catch (error) {
            console.error('스터디룸 통계 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 서비스 종료 (연결 해제)
     */
    async disconnect() {
        try {
            await mongoDBManager.disconnect();
            console.log('MongoDB 서비스 연결 해제 완료');
        } catch (error) {
            console.error('MongoDB 서비스 연결 해제 실패:', error);
        }
    }

    /**
     * 연결 상태 확인
     */
    isConnected() {
        try {
            return mongoDBManager.isConnected;
        } catch (error) {
            return false;
        }
    }

    /**
     * 헬스 체크
     */
    async healthCheck() {
        try {
            return await mongoDBManager.healthCheck();
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// 싱글톤 인스턴스 생성
const mongoService = new MongoService();

module.exports = mongoService; 