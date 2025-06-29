import axios from 'axios';
import { API_URL } from '../config/index.mjs';
import * as logger from '../util/logger.mjs';

class SpringClient {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.apiClient.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`API Response Error: ${error.response?.status} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * JWT 토큰 검증 (현재 사용자 정보 조회로 검증)
   * @param {string} token - JWT 토큰
   * @returns {Promise<{valid: boolean, user?: object, error?: string}>}
   */
  async validateToken(token) {
    try {
      if (!token) {
        return { valid: false, error: 'Token is required' };
      }

      // /api/members/me 엔드포인트를 사용해서 토큰 검증
      const response = await this.apiClient.get('/api/members/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.data) {
        return {
          valid: true,
          user: {
            id: response.data.data.id,
            username: response.data.data.username,
            email: response.data.data.email,
            name: response.data.data.name,
            nickname: response.data.data.nickname,
            role: 'user' // 기본 역할
          }
        };
      } else {
        return {
          valid: false,
          error: response.data?.message || 'Token validation failed'
        };
      }
    } catch (error) {
      logger.error('Token validation error:', error.message);
      
      // 401 Unauthorized인 경우 토큰이 유효하지 않음
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Invalid or expired token'
        };
      }
      
      // 네트워크 오류나 서버 오류 시 개발 환경에서는 허용
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Development mode: allowing connection despite validation error');
        return {
          valid: true,
          user: {
            id: 'dev-user',
            username: 'developer@bridgehub.com',
            email: 'developer@bridgehub.com',
            name: 'Developer',
            nickname: 'Dev',
            role: 'user'
          }
        };
      }

      return {
        valid: false,
        error: error.response?.data?.message || error.message || 'Token validation failed'
      };
    }
  }

  /**
   * ID로 사용자 정보 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<object|null>}
   */
  async getUserInfo(userId) {
    try {
      const response = await this.apiClient.get(`/api/members/id/${userId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user info for ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * 스터디룸 정보 조회
   * @param {string} roomId - 룸 ID (스터디룸 ID)
   * @returns {Promise<object|null>}
   */
  async getStudyRoomInfo(roomId) {
    try {
      const response = await this.apiClient.get(`/api/studies/${roomId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting study room info for ${roomId}:`, error.message);
      return null;
    }
  }

  /**
   * 채팅방 정보 조회
   * @param {string} roomId - 채팅방 ID
   * @returns {Promise<object|null>}
   */
  async getChatRoomInfo(roomId) {
    try {
      const response = await this.apiClient.get(`/api/chatrooms/${roomId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting chat room info for ${roomId}:`, error.message);
      return null;
    }
  }

  /**
   * 스터디룸 멤버 확인
   * @param {string} studyRoomId - 스터디룸 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>}
   */
  async isStudyRoomMember(studyRoomId, userId) {
    try {
      const response = await this.apiClient.get(`/api/studies/${studyRoomId}/members`);
      if (response.data && response.data.success && response.data.data) {
        const members = response.data.data;
        return members.some(member => 
          member.memberId === userId && member.status === 'APPROVED'
        );
      }
      return false;
    } catch (error) {
      logger.error(`Error checking study room membership:`, error.message);
      return false;
    }
  }

  /**
   * 메시지 저장 (채팅 로그)
   * @param {object} messageData - 메시지 데이터
   * @returns {Promise<boolean>}
   */
  async saveMessage(messageData) {
    try {
      const response = await this.apiClient.post('/api/messages', {
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        content: messageData.content,
        messageType: messageData.messageType || 'TEXT'
      });
      
      return response.data && response.data.success;
    } catch (error) {
      logger.error(`Error saving message:`, error.message);
      return false;
    }
  }

  /**
   * 서버 상태를 API에 보고 (헬스체크 활용)
   * @param {object} stats - 서버 통계
   * @returns {Promise<boolean>}
   */
  async reportServerStats(stats) {
    try {
      // 헬스체크 엔드포인트에 통계 정보를 로그로 남김
      logger.log('RTC Server Stats:', {
        activeRooms: stats.activeRooms,
        totalParticipants: stats.totalParticipants,
        authenticatedUsers: stats.authenticatedUsers,
        uptime: stats.uptime,
        timestamp: new Date().toISOString()
      });
      
      // 실제 API 서버에 통계를 보내는 엔드포인트가 없으므로 로그만 남김
      return true;
    } catch (error) {
      logger.debug('Error reporting server stats:', error.message);
      return false;
    }
  }

  /**
   * 관리자 권한 확인
   * @param {string} token - JWT 토큰
   * @returns {Promise<boolean>}
   */
  async checkAdminPermission(token) {
    try {
      const response = await this.apiClient.get('/api/auth/check-admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data && response.data.success && response.data.data === true;
    } catch (error) {
      logger.error('Error checking admin permission:', error.message);
      return false;
    }
  }

  /**
   * 신고 생성
   * @param {object} reportData - 신고 데이터
   * @param {string} token - JWT 토큰
   * @returns {Promise<boolean>}
   */
  async createReport(reportData, token) {
    try {
      const response = await this.apiClient.post('/api/reports', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data && response.data.success;
    } catch (error) {
      logger.error('Error creating report:', error.message);
      return false;
    }
  }

  /**
   * 서버 헬스체크
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await this.apiClient.get('/api/health');
      return response.data && response.data.success;
    } catch (error) {
      logger.debug('Health check failed:', error.message);
      return false;
    }
  }
}

// 싱글톤 인스턴스
let springClient;

export function getSpringClient() {
  if (!springClient) {
    springClient = new SpringClient();
  }
  return springClient;
}

export default SpringClient;
