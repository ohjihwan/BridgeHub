// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/admin',   // Vite proxy로 8800번 백엔드로 포워딩 됩니다
});

// Users
export const fetchUsers = ({ page = 0, size = 10 }) =>
  api.get('/users', { params: { page, size } });

// 회원 상태 변경 (status: "ACTIVE", "INACTIVE", "SUSPENDED")
export const updateUserRole = (id, status) =>
  api.patch(`/users/${id}/status`, null, { params: { status } });

// Reports (신고 목록)
export const fetchReports = ({ page = 0, size = 10 }) =>
  api.get('/reports', { params: { page, size } });

// 신고 처리
export const resolveReport = (id, data) =>
  api.post(`/reports/${id}/resolve`, data);

// Logs (관리 로그)
export const fetchLogs = ({ page = 0, size = 10 }) =>
  api.get('/logs', { params: { page, size } });

// Statistics (통계)
export const fetchStatistics = () => api.get('/statistics');

// 회원 통계
export const fetchMemberStatistics = () => api.get('/statistics/members');

// 신고 통계
export const fetchReportStatistics = () => api.get('/statistics/reports');