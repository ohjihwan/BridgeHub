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

  async validateToken(token) {
    try {
      if (!token) {
        return { valid: false, error: 'Token is required' };
      }

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
            role: 'user'
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
      
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Invalid or expired token'
        };
      }
      
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

  async reportServerStats(stats) {
    try {
      logger.log('RTC Server Stats:', {
        activeRooms: stats.activeRooms,
        totalParticipants: stats.totalParticipants,
        authenticatedUsers: stats.authenticatedUsers,
        uptime: stats.uptime,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      logger.debug('Error reporting server stats:', error.message);
      return false;
    }
  }

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

let springClient;

export function getSpringClient() {
  if (!springClient) {
    springClient = new SpringClient();
  }
  return springClient;
}

export default SpringClient;
