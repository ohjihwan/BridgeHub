import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto'

// --- Main Components ---

const SummaryCard = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{data.value}</span>
      <ChangeIndicator value={data.change} type={data.change > 0 ? 'up' : 'down'} />
    </div>
  </div>
);

const MemberDistributionCard = ({ data }) => {
  const Bar = ({ label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
      <span style={{ width: '60px', fontSize: '14px' }}>{label}</span>
      <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '20px', display: 'flex' }}>
        <div style={{ width: `${value}%`, background: color, borderRadius: '4px' }}></div>
      </div>
      <span style={{ width: '40px', textAlign: 'right', fontSize: '14px' }}>{value}%</span>
    </div>
  );

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
       <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
      <div>
        <Bar label="남성" value={data.gender.male} color="#3182ce" />
        <Bar label="여성" value={data.gender.female} color="#e53e3e" />
      </div>
      <div style={{ marginTop: '20px' }}>
        {data.age.map(item => (
          <div key={item.range} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <span style={{ width: '60px', fontSize: '14px' }}>{item.range}</span>
            <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '20px', display: 'flex' }}>
              <div style={{ width: `${item.male}%`, background: '#3182ce', borderRadius: '4px 0 0 4px' }}></div>
              <div style={{ width: `${item.female}%`, background: '#e53e3e', borderRadius: '0 4px 4px 0' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SalesTrendCard = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    {data.items.map(item => (
      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>{item.label}</span>
        <div style={{display: 'flex', alignItems: 'baseline', gap: '10px'}}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.value}</span>
          <ChangeIndicator value={item.change} type={item.change > 0 ? 'up' : 'down'} />
        </div>
      </div>
    ))}
  </div>
);

const Top10Table = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr>
          {data.headers.map(header => (
            <th key={header} style={{ padding: '10px', background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map(row => (
          <tr key={row[0]}>
            {row.map((cell, index) => (
              <td key={index} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                {typeof cell === 'object' ? <ChangeIndicator value={cell.value} type={cell.type} /> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- 기존 데이터 구조 ---
const chartDataList = [
  {
    id: 'gender',
    title: '성별',
    data: {
      labels: ['남성', '여성'],
      datasets: [{ data: [50, 15], backgroundColor: ['#0043AC', '#FF9F40'] }]
    },
    legend: ['남성', '여성']
  },
  {
    id: 'school',
    title: '학력',
    data: {
      labels: ['고졸', '대학교', '대학원'],
      datasets: [{ data: [35, 50, 15], backgroundColor: ['#0043AC', '#36A2EB', '#FF9F40'] }]
    },
    legend: ['고졸', '대학교', '대학원']
  },
  {
    id: 'time',
    title: '활동 시간대',
    data: {
      labels: ['06:00~12:00', '12:00~18:00', '18:00~24:00'],
      datasets: [{ data: [35, 50, 15], backgroundColor: ['#0043AC', '#36A2EB', '#FF9F40'] }]
    },
    legend: ['06:00~12:00', '12:00~18:00', '18:00~24:00']
  },
  {
    id: 'major',
    title: '전공',
    data: {
      labels: ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합'],
      datasets: [{ data: [20, 15, 20, 10, 10, 10, 10, 5], backgroundColor: [' #0043AC', ' #36A2EB', ' #FF9F40', ' #FFCD56', ' #4BC0C0', ' #9966FF', ' #C9CBCF', ' #DE7C7D'] }]
    },
    legend: ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합']
  }
];

const barData = {
  labels: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
  datasets: [
    {
      label: '신규 가입자 수',
      data: [200, 400, 300, 500, 600, 700, 800],
      backgroundColor: '#0043AC'
    },
    {
      label: '총 접속자 수',
      data: [400, 800, 600, 1000, 1200, 1400, 1600],
      backgroundColor: '#FF9F40'
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

// --- 헬퍼 컴포넌트 ---
const Card = ({ children, style, ...rest }) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    ...style
  }} {...rest}>
    {children}
  </div>
);

const MiniChartCard = ({ chart, isActive, onClick }) => (
  <Card style={{ 
    cursor: 'pointer', 
    border: isActive ? '2px solid #6a6cff' : '2px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  }} onClick={onClick}>
    <h4 style={{ margin: 0, fontSize: '16px', color: '#555', textAlign: 'center' }}>{chart.title}</h4>
    <div style={{ width: '100px', height: '100px' }}>
      <Doughnut data={chart.data} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: true }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px 8px', fontSize: '11px', width: '100%' }}>
      {chart.legend.map((item, idx) => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chart.data.datasets[0].backgroundColor[idx], marginRight: '4px', flexShrink: 0 }}></span>
          {item}
        </div>
      ))}
    </div>
  </Card>
);

const ListCard = ({ title, items, renderItem }) => (
  <Card>
    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>{title}</h3>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, index) => (
        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#666' }}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  </Card>
);

// --- Main Statistics Component ---
export default function Statistics() {
  const [selectedChart, setSelectedChart] = useState(chartDataList[0]);

  return (
    <div style={{ padding: '20px', background: '#f4f7fa' }}>
      {/* 페이지 제목 */}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>통계</h1>

      {/* 상단: 작은 도넛 차트들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {chartDataList.map(chart => (
          <MiniChartCard
            key={chart.id}
            chart={chart}
            isActive={selectedChart.id === chart.id}
            onClick={() => setSelectedChart(chart)}
          />
        ))}
      </div>

      {/* 메인 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* 선택된 차트 상세 */}
        <Card style={{ gridColumn: 'span 1' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>{selectedChart.title} 상세</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={selectedChart.data} options={{ plugins: { legend: { position: 'right' } } }} />
          </div>
        </Card>
        
        {/* 방문자 수 바 차트 */}
        <Card style={{ gridColumn: 'span 2' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>방문자 수</h3>
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </Card>
        
        {/* 하단 위젯들 */}
        <ListCard 
          title="활동 TOP 5"
          items={topActiveUsers}
          renderItem={user => (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{user.name}</span>
              <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{user.activity}회</span>
            </div>
          )}
        />
        <ListCard
          title="인기 채팅방"
          items={popularRooms}
          renderItem={room => (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{room.name}</span>
              <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{room.count}명</span>
            </div>
          )}
        />
        <ListCard
          title="최근 신고"
          items={recentReports}
          renderItem={report => (
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <span>{report.reporter} → {report.target}</span>
              <span style={{ color: '#888' }}>({report.reason})</span>
            </div>
          )}
        />
      </div>

      {/* 반응형 스타일 */}
      <style>{`
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          .main-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
