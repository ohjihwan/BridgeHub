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
      labels: ['컴퓨터공학', '소프트웨어', '정보통신'],
      datasets: [{ data: [50, 15, 35], backgroundColor: ['#6a6cff', '#e573b7', '#a084e8'] }]
    },
    legend: ['컴퓨터공학', '소프트웨어', '정보통신']
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
      {/* 상단: 작은 도넛 차트들 (고정 4개 한 줄) */}
      <div className="summary-charts-final">
        {chartDataList.map(chart => (
          <div key={chart.id} className={`mini-chart-final${selectedChart.id === chart.id ? ' active' : ''}`} onClick={() => setSelectedChart(chart)}>
            <Doughnut data={chart.data} options={{ plugins: { legend: { display: false } } }} />
            <div className="chart-title">{chart.title}</div>
            <div className="chart-legend">
              {chart.legend.map((item, idx) => (
                <div key={item} className="legend-item">
                  <span className="legend-color" style={{ background: chart.data.datasets[0].backgroundColor[idx] }}></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 중간: 2단 그리드 (왼쪽: 큰 도넛, 오른쪽: 방문자수) */}
      <div className="statistics-main-grid-final">
        <div className="main-chart-box main-doughnut-box-final">
          <h3>{selectedChart.title} 상세</h3>
          <Doughnut data={selectedChart.data} options={{ plugins: { legend: { position: 'right' } } }} />
          <div className="main-legend">
            {selectedChart.legend.map((item, idx) => (
              <div key={item} className="legend-item">
                <span className="legend-color" style={{ background: selectedChart.data.datasets[0].backgroundColor[idx] }}></span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="main-chart-box main-bar-box-final">
          <h3>방문자 수</h3>
          <div className="visitor-count">5,000,00</div>
          <Bar data={barData} options={{ plugins: { legend: { position: 'top' } }, responsive: true }} />
        </div>
      </div>
      {/* 하단: 위젯 3개 가로 배치 */}
      <div className="statistics-widgets-row-final">
        <div className="widget-box-final">
          <h4>활동 TOP 5</h4>
          <ul>
            {topActiveUsers.map(user => (
              <li key={user.name}><span>{user.name}</span><span>{user.activity}회</span></li>
            ))}
          </ul>
        </div>
        <div className="widget-box-final">
          <h4>인기 채팅방</h4>
          <ul>
            {popularRooms.map(room => (
              <li key={room.name}><span>{room.name}</span><span>{room.count}명</span></li>
            ))}
          </ul>
        </div>
        <div className="widget-box-final">
          <h4>최근 신고</h4>
          <ul>
            {recentReports.map(report => (
              <li key={report.id}><span>{report.reporter}→{report.target}</span><span>{report.reason}({report.date})</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
