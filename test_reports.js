// 신고 데이터 생성 테스트 스크립트
const axios = require('axios');

const API_BASE = 'http://localhost:7100/api/admin';

async function createTestReports() {
  try {
    console.log('테스트 신고 데이터 생성 시작...');
    
    // 1. 먼저 기존 신고 데이터 확인
    const reportsResponse = await axios.get(`${API_BASE}/reports?page=0&size=10`);
    console.log('기존 신고 데이터:', reportsResponse.data);
    
    // 2. 테스트 데이터 초기화 API 호출
    const initResponse = await axios.post(`${API_BASE}/init-test-data`);
    console.log('테스트 데이터 초기화 결과:', initResponse.data);
    
    // 3. 다시 신고 데이터 확인
    const newReportsResponse = await axios.get(`${API_BASE}/reports?page=0&size=10`);
    console.log('새로운 신고 데이터:', newReportsResponse.data);
    
  } catch (error) {
    console.error('에러 발생:', error.response?.data || error.message);
  }
}

createTestReports(); 