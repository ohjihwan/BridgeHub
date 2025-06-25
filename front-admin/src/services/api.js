// src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/admin',   // Vite proxy로 8800번 백엔드로 포워딩 됩니다
});

// Users
export const fetchUsers = ({ page = 0, size = 10 }) =>
  api.get('/users', { params: { page, size } });

// 권한 변경 (role: "ADMIN" 등)
export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}`, null, { params: { role } });

// Reports (신고 목록)
export const fetchReports = ({ page = 0, size = 10 }) =>
  api.get('/reports', { params: { page, size } });

// 신고 처리
export const resolveReport = (id) =>
  api.post(`/reports/${id}/resolve`);

// Logs (관리 로그)
export const fetchLogs = ({ page = 0, size = 10 }) =>
  api.get('/logs', { params: { page, size } });

// Statistics (통계)
export const fetchStatistics = () => api.get('/statistics');