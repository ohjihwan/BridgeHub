// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/admin',   // Vite proxy로 8800번 백엔드로 포워딩 됩니다
});

// JWT 토큰을 자동으로 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Users
export const fetchUsers = ({ page = 0, size = 10 }) =>
  api.get('/users', { params: { page, size } });

// 권한 변경 (role: "ADMIN" 등)
export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}`, null, { params: { role } });

// 회원 상태 변경 (status: "ACTIVE", "SUSPENDED" 등)
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, null, { params: { status } });

// Reports (신고 목록)
export const fetchReports = ({ page = 0, size = 10 }) =>
  api.get('/reports', { params: { page, size } });

// 신고 처리
export const resolveReport = (id, data = {}) =>
  api.post(`/reports/${id}/resolve`, {
    penaltyType: data.penaltyType || '',
    penalty: data.penalty || '',
    adminNote: data.adminNote || ''
  });

// Statistics (통계)
export const fetchStatistics = () =>
  api.get('/statistics');

export const fetchMemberStatistics = () =>
  api.get('/statistics/members');

export const fetchReportStatistics = () =>
  api.get('/statistics/reports');

// Logs (관리 로그)
export const fetchLogs = ({ page = 0, size = 10 }) =>
  api.get('/logs', { params: { page, size } });
