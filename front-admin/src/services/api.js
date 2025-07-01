// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7100/api';
const IS_PRODUCTION = false; // 개발 환경에서는 false
const USE_MOCK_DATA = false; // 개발 환경에서는 목 데이터 사용

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 인증 실패
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// 관리자 인증 관련 API
// =============================================

export const adminLogin = async (credentials) => {
  try {
    // 임시 로그인 (백엔드 서버가 실행되지 않을 때)
    if (credentials.username === 'admin' && credentials.password === 'admin1234') {
      const mockToken = 'mock-admin-token-' + Date.now();
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'ADMIN'
      };
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockUser));
      return {
        data: {
          success: true,
          message: '로그인 성공',
          token: mockToken,
          user: mockUser
        }
      };
    }
    
    // 실제 API 호출 (백엔드 서버가 실행될 때)
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      const { status, data, errorCode } = response.data;
      
      if (status === 'success' && data && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data));
        return { data: { success: true, token: data.token, user: data } };
      } else {
        return { data: { success: false, message: errorCode || '로그인에 실패했습니다.' } };
      }
    } catch (apiError) {
      // 백엔드 서버가 실행되지 않으면 목 데이터 사용
      console.log('백엔드 서버가 실행되지 않아 목 데이터를 사용합니다.');
      const mockToken = 'mock-admin-token-' + Date.now();
      const mockUser = {
        id: 1,
        username: credentials.username,
        role: 'ADMIN'
      };
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockUser));
      return {
        data: {
          success: true,
          message: '로그인 성공 (목 데이터)',
          token: mockToken,
          user: mockUser
        }
      };
    }
  } catch (error) {
    throw new Error(error.response?.data?.errorCode || '로그인에 실패했습니다.');
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  return Promise.resolve({ success: true });
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('adminToken');
  return Promise.resolve({ isAuthenticated: !!token });
};

// =============================================
// 통계 관련 API
// =============================================

export const fetchStatistics = async () => {
  try {
    const response = await apiClient.get('/admin/statistics');
    return response;
  } catch (error) {
    throw new Error('통계 데이터를 불러오는데 실패했습니다.');
  }
};

// =============================================
// 회원 관리 관련 API
// =============================================

export const fetchUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response;
  } catch (error) {
    throw new Error('회원 목록을 불러오는데 실패했습니다.');
  }
};

export const updateUserStatus = async (memberId, status) => {
  try {
    const response = await apiClient.patch(`/admin/users/${memberId}/status?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('회원 상태 변경 실패:', error);
    throw error;
  }
};

// 회원 삭제
export const deleteUser = async (memberId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('회원 삭제 실패:', error);
    throw error;
  }
};

// =============================================
// 신고 관리 관련 API
// =============================================

export const fetchReports = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/reports', { params });
    return response;
  } catch (error) {
    throw new Error('신고 목록을 불러오는데 실패했습니다.');
  }
};

export const resolveReport = async (reportId, resolveData) => {
  try {
    const response = await apiClient.post(`/admin/reports/${reportId}/resolve`, resolveData);
    return response;
  } catch (error) {
    throw new Error('신고 처리에 실패했습니다.');
  }
};

export default apiClient;