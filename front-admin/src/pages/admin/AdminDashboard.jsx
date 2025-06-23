import React, { useState, useEffect } from 'react';
import '../../assets/scss/AdminDashboard.scss';
import logo from '../../assets/imgs/ico/logo.svg';
import { fetchStatistics } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalReports: 0,
    totalVisitors: 0
  });
  const [loading, setLoading] = useState(false);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetchStatistics();
      
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalMembers: data.memberStats ? 
            Object.values(data.memberStats.gender || {}).reduce((a, b) => a + b, 0) : 0,
          totalReports: data.reportStats?.recentReports?.length || 0,
          totalVisitors: data.activityStats?.totalVisitors || 0
        });
      }
    } catch (error) {
      console.error('대시보드 통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  return (
    <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
      <img src={logo} alt="로고" style={{width: 180, marginBottom: 32}} />
      <h1>BridgeHub 관리자 대시보드</h1>
      <p>좌측 메뉴에서 원하는 기능을 선택하세요.</p>
      
      {!loading && (
        <div style={{ 
          marginTop: 40, 
          display: 'flex', 
          gap: 32, 
          flexWrap: 'wrap', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '20px 24px', 
            borderRadius: 16, 
            boxShadow: '0 2px 8px rgba(160,132,232,0.08)',
            textAlign: 'center',
            minWidth: 120
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6a6cff' }}>
              {stats.totalMembers.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>총 회원 수</div>
          </div>
          <div style={{ 
            background: '#fff', 
            padding: '20px 24px', 
            borderRadius: 16, 
            boxShadow: '0 2px 8px rgba(160,132,232,0.08)',
            textAlign: 'center',
            minWidth: 120
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e573b7' }}>
              {stats.totalReports}
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>처리할 신고</div>
          </div>
          <div style={{ 
            background: '#fff', 
            padding: '20px 24px', 
            borderRadius: 16, 
            boxShadow: '0 2px 8px rgba(160,132,232,0.08)',
            textAlign: 'center',
            minWidth: 120
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#a084e8' }}>
              {stats.totalVisitors.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>총 방문자</div>
          </div>
        </div>
      )}
    </div>
  );
}
