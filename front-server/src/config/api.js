const API_BASE_URL = 'http://localhost:7100/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  
  // 스터디룸 관련
  STUDY_ROOMS: '/study-rooms',
  HOT_ROOMS: '/study-rooms/hot',
  
  // 멤버 관련
  PROFILE: '/members/profile',
  MY_STUDY_ROOMS: '/members/study-rooms',
  
  // 파일 관련
  FILE_UPLOAD: '/files/upload',
  THUMBNAIL_UPLOAD: '/files/upload/thumbnail',
  
  // 채팅 관련
  CHAT_MESSAGES: '/messages',
  CHAT_ROOMS: '/chat-rooms'
};

export default apiConfig; 