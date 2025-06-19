import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../assets/scss/AdminDashboard.scss';

const chartDataList = [
  {
    id: 'gender',
    title: '성별',
    data: {
      labels: ['남성', '여성'],
      datasets: [{ data: [50, 15], backgroundColor: ['#6a6cff', '#e573b7'] }]
    },
    legend: ['남성', '여성']
  },
  {
    id: 'school',
    title: '학력',
    data: {
      labels: ['고졸', '대학교', '대학원'],
      datasets: [{ data: [35, 50, 15], backgroundColor: ['#6a6cff', '#a084e8', '#e573b7'] }]
    },
    legend: ['고졸', '대학교', '대학원']
  },
  {
    id: 'time',
    title: '활동 시간대',
    data: {
      labels: ['06:00~12:00', '12:00~18:00', '18:00~24:00'],
      datasets: [{ data: [35, 50, 15], backgroundColor: ['#6a6cff', '#a084e8', '#e573b7'] }]
    },
    legend: ['06:00~12:00', '12:00~18:00', '18:00~24:00']
  },
  {
    id: 'major',
    title: '전공',
    data: {
      labels: ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합'],
      datasets: [{ data: [50, 15, 35, 10, 5, 5, 5, 5], backgroundColor: ['#6a6cff', '#e573b7', '#a084e8', '#6a6cff', '#e573b7', '#a084e8', '#6a6cff', '#e573b7'] }]
    },
    legend: ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합']
  }
];

const barData = {
  labels: ['q1', 'q2', 'q3', 'q4'],
  datasets: [
    {
      label: '신규 가입자 수',
      data: [200, 400, 300, 500],
      backgroundColor: '#6a6cff'
    },
    {
      label: '총 접속자 수',
      data: [400, 800, 600, 1000],
      backgroundColor: '#e573b7'
    }
  ]
};

const topActiveUsers = [
  { name: '이민우', activity: 120 },
  { name: '노현지', activity: 110 },
  { name: '김철수', activity: 100 },
  { name: '최영희', activity: 95 },
  { name: '한지민', activity: 90 }
];

const recentReports = [
  { id: 1, reporter: '이민우', target: '오지환', reason: '욕설', date: '2024-01-15' },
  { id: 2, reporter: '노현지', target: '이민우', reason: '스팸', date: '2024-01-14' },
  { id: 3, reporter: '김철수', target: '박영희', reason: '부적절', date: '2024-01-13' },
  { id: 4, reporter: '최영희', target: '정민수', reason: '괴롭힘', date: '2024-01-12' }
];

const popularRooms = [
  { name: '프로그래밍 스터디 A', count: 45 },
  { name: '영어 스터디 B', count: 38 },
  { name: '취미 공유방', count: 32 },
  { name: '자유게시판', count: 28 },
  { name: '정보공유방', count: 25 }
];

export default function Statistics() {
  const [selectedChart, setSelectedChart] = useState(chartDataList[0]);

  return (
    <div className="dashboard-admin statistics-final">
      {/* 상단: 작은 도넛 차트들 (고정 4개 한 줄, 모바일 2x2) */}
      <div className="summary-charts-final" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 24 }}>
        {chartDataList.map(chart => (
          <div
            key={chart.id}
            className={`mini-chart-final${selectedChart.id === chart.id ? ' active' : ''}`}
            onClick={() => setSelectedChart(chart)}
            style={{ width: '100%', maxWidth: 320, minWidth: 180, background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px rgba(160,132,232,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 8, padding: 12, margin: '0 8px' }}
          >
            <div style={{ width: '100%', maxWidth: 220, minWidth: 120, margin: '0 auto' }}>
              <Doughnut
                data={chart.data}
                options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: true }}
              />
            </div>
            <div className="chart-title" style={{ marginTop: 12, fontSize: 17, fontWeight: 700, color: '#6a6cff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{chart.title}</div>
            <div className="chart-legend" style={{ marginTop: 10, width: '100%' }}>
              {chart.legend.map((item, idx) => (
                <div key={item} className="legend-item" style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  <span className="legend-color" style={{ background: chart.data.datasets[0].backgroundColor[idx], width: 14, height: 14, borderRadius: '50%', marginRight: 8, display: 'inline-block' }}></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 중간: 2단 그리드 (왼쪽: 큰 도넛, 오른쪽: 방문자수) */}
      <div className="statistics-main-grid-final" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, margin: '40px 0', justifyContent: 'center' }}>
        <div className="main-chart-box main-doughnut-box-final" style={{ flex: '1 1 380px', minWidth: 260, maxWidth: 480, background: '#fff', borderRadius: 22, boxShadow: '0 4px 16px rgba(160,132,232,0.10)', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#a084e8', marginBottom: 16, textAlign: 'center' }}>{selectedChart.title} 상세</h3>
          <div style={{ width: '100%', maxWidth: 320, minWidth: 160, margin: '0 auto' }}>
            <Doughnut
              data={selectedChart.data}
              options={{ plugins: { legend: { position: 'right', labels: { font: { size: 15 } } } }, responsive: true, maintainAspectRatio: true }}
            />
          </div>
          <div className="main-legend" style={{ marginTop: 16, width: '100%' }}>
            {selectedChart.legend.map((item, idx) => (
              <div key={item} className="legend-item" style={{ fontSize: 15, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                <span className="legend-color" style={{ background: selectedChart.data.datasets[0].backgroundColor[idx], width: 14, height: 14, borderRadius: '50%', marginRight: 8, display: 'inline-block' }}></span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="main-chart-box main-bar-box-final" style={{ flex: '2 1 700px', minWidth: 320, maxWidth: 900, width: '100%', background: '#fff', borderRadius: 22, boxShadow: '0 4px 16px rgba(160,132,232,0.10)', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#a084e8', marginBottom: 16, textAlign: 'center' }}>방문자 수</h3>
          <div className="visitor-count" style={{ fontSize: 22, fontWeight: 700, color: '#6a6cff', marginBottom: 12, marginTop: -4, textAlign: 'left', width: '100%' }}>5,000,00</div>
          <div style={{ width: '100%', maxWidth: 700, minWidth: 220, margin: '0 auto' }}>
            <Bar
              data={barData}
              options={{
                plugins: { legend: { position: 'top', labels: { font: { size: 15 } } } },
                responsive: true,
                maintainAspectRatio: true,
              }}
            />
          </div>
        </div>
      </div>
      {/* 하단: 위젯 3개 가로 배치, 모바일 세로 */}
      <div className="statistics-widgets-row-final" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        <div className="widget-box-final" style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 320, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(160,132,232,0.08)', padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#a084e8', marginBottom: 8 }}>활동 TOP 5</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {topActiveUsers.map(user => (
              <li key={user.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#444', padding: '4px 0', borderBottom: '1px dashed #f0e9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span>{user.name}</span><span style={{ color: '#6a6cff', fontWeight: 600 }}>{user.activity}회</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="widget-box-final" style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 320, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(160,132,232,0.08)', padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#a084e8', marginBottom: 8 }}>인기 채팅방</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {popularRooms.map(room => (
              <li key={room.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#444', padding: '4px 0', borderBottom: '1px dashed #f0e9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span>{room.name}</span><span style={{ color: '#6a6cff', fontWeight: 600 }}>{room.count}명</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="widget-box-final" style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 320, background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(160,132,232,0.08)', padding: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#a084e8', marginBottom: 8 }}>최근 신고</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentReports.map(report => (
              <li key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#444', padding: '4px 0', borderBottom: '1px dashed #f0e9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span>{report.reporter}→{report.target}</span><span style={{ color: '#6a6cff', fontWeight: 600 }}>{report.reason}({report.date})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* 반응형 미디어 쿼리: 모바일에서 세로 배치 */}
      <style>{`
        @media (max-width: 900px) {
          .summary-charts-final { flex-direction: column !important; align-items: center !important; }
          .statistics-main-grid-final { flex-direction: column !important; align-items: center !important; }
          .statistics-widgets-row-final { flex-direction: column !important; align-items: center !important; }
        }
      `}</style>
    </div>
  );
}
