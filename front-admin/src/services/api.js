// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/admin',   // Vite proxy로 7100번 백엔드로 포워딩 됩니다
  timeout: 10000,
});

// 요청 인터셉터 - 인증 토큰 추가
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API (기존 MemberController의 로그인 API 활용)
export const adminLogin = (credentials) => 
  axios.post('/api/auth/login', credentials); // 일반 로그인 API 사용

export const adminLogout = () => 
  api.post('/auth/logout');

// Users (기존 AdminController API 활용)
export const fetchUsers = ({ page = 0, size = 10 }) =>
  api.get('/users', { params: { page, size } });

// 권한 변경 (role: "ADMIN" 등)
export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}`, null, { params: { role } });

// 회원 상태 변경 (정지/활성화)
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, null, { params: { status } });

// Reports (기존 AdminController API 활용)
export const fetchReports = ({ page = 0, size = 10 }) =>
  api.get('/reports', { params: { page, size } });

// 신고 처리
export const resolveReport = (id, resolveData) =>
  api.post(`/reports/${id}/resolve`, resolveData);

// Logs (관리 로그)
export const fetchLogs = ({ page = 0, size = 10 }) =>
  api.get('/logs', { params: { page, size } });

// Statistics (기존 AdminController API 활용)
export const fetchStatistics = () => api.get('/statistics');
export const fetchMemberStatistics = () => api.get('/statistics/members');
export const fetchReportStatistics = () => api.get('/statistics/reports');