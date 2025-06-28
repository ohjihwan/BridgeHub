import React, { useState, useEffect } from 'react';
import '../../assets/scss/AdminDashboard.scss';
import logo from '../../assets/imgs/ico/logoc.svg';
import { fetchStatistics } from '../../services/api';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetchStatistics();
        setStatistics(response.data.data);
      } catch (err) {
        console.error('통계 데이터 로드 실패:', err);
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
        <img src={logo} alt="로고" style={{width: 500, marginBottom: -120, opacity: 0.15}} />
        <div style={{marginTop: 20}}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
        <img src={logo} alt="로고" style={{width: 500, marginBottom: -120, opacity: 0.15}} />
        <div style={{marginTop: 20, color: 'red'}}>{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
      <img src={logo} alt="로고" style={{width: 500, marginBottom: -120, opacity: 0.15}} />
      
      {statistics && (
        <div style={{marginTop: 20, textAlign: 'center'}}>
          <h3>관리자 대시보드</h3>
          <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px', minWidth: '150px'}}>
              <h4>회원 통계</h4>
              <p>총 회원 수: {statistics.memberStats?.totalMembers || 0}</p>
              <p>활성 회원: {statistics.memberStats?.activeMembers || 0}</p>
            </div>
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px', minWidth: '150px'}}>
              <h4>신고 통계</h4>
              <p>총 신고 수: {statistics.reportStats?.totalReports || 0}</p>
              <p>대기 중: {statistics.reportStats?.pendingReports || 0}</p>
            </div>
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px', minWidth: '150px'}}>
              <h4>활동 통계</h4>
              <p>총 스터디룸: {statistics.activityStats?.totalStudyRooms || 0}</p>
              <p>총 채팅방: {statistics.activityStats?.totalChatRooms || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
