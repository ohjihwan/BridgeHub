import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// --- Data Structures ---
const summaryData = [
  { title: '총 방문 이용자 수', value: '3,668 명', change: -34, description: '월별 해당 매장을 방문한 총 사용 수 입니다.' },
  { title: '총 방문자 수', value: '1,292 명', change: -25, description: '월별 해당 매장을 방문한 총 이용자 수 입니다.' },
  { title: '신규 회원', value: '290 명', change: -38, description: '월별 해당 매장에 신규 가입한 회원 입니다.' },
  { title: '총 매출', value: '31,653,100 원', change: -35, description: '월별 해당 매장에서 발생된 전체 매출의 총합 입니다.' },
  { title: 'PC 이용 매출', value: '15,302,000 원', change: -32, description: '월별 해당 매장에서 발생된 총 PC이용 매출의 총합 입니다.' },
  { title: '상품 매출', value: '16,351,100 원', change: -38, description: '월별 해당 상품 매출의 총합 입니다.' },
];

const memberDistributionData = {
  title: '회원 분포',
  description: '검색 기간 동안 방문한 회원 성별 및 연령별 비율',
  gender: { male: 77, female: 23 },
  age: [
    { range: '10대', female: 18, male: 82 },
    { range: '20대', female: 24, male: 76 },
    { range: '30대', female: 22, male: 78 },
    { range: '40대', female: 12, male: 88 },
    { range: '50대 이상', female: 25, male: 75 },
  ]
};

const salesTrendData = {
  pc: {
    title: 'PC 이용 매출 추이',
    description: '월별 해당 PC 이용 금액 분석 정보입니다.',
    items: [
      { label: '1인당 평균 이용금액', value: '12,930.74 원', change: -8 },
      { label: '1회 평균 이용 금액', value: '5,687.22 원', change: -7 },
      { label: '1회 평균 이용 시간', value: '1시간 51분', change: 32 },
      { label: '회원 재방문율', value: '21 %', change: -10 },
    ]
  },
  product: {
    title: '상품 매출 추이',
    description: '월별 해당 상품 매출을 분석 한 정보입니다.',
    items: [
      { label: '1인당 평균 이용금액', value: '21,486.33 원', change: -20 },
      { label: '상품 구매금액', value: '16,351,100 원', change: -38 },
      { label: '상품 구매자', value: '761 명', change: -23 },
      { label: '상품 구매수', value: '5,017 회', change: -38 },
    ]
  }
};

const top10Data = {
  gameUsage: {
    title: '게임 사용량 Top 10',
    description: '검색 기간 동안 사용량이 많은 게임 목록 20개 입니다.',
    headers: ['순위', '게임 이름', '총 사용 시간', '점유율', '이용자 수', '증감률'],
    rows: [
      [1, '리그 오브 레전드(NEW)', '4029시간 39분', 44.57, 1826, { value: -40, type: 'down' }],
      [2, '배틀그라운드', '1107시간 56분', 12.26, 506, { value: -13, type: 'down' }],
      [3, '오버워치', '632시간 43분', 7.00, 363, { value: -20, type: 'down' }],
      [4, 'FC온라인', '619시간 52분', 6.86, 507, { value: -27, type: 'down' }],
      [5, '메이플스토리', '522시간 38분', 5.78, 202, { value: 116, type: 'up' }],
    ]
  },
  payment: {
    title: '결제 회원 Top 10',
    description: '회원 중 결제가 많은 회원 10명입니다.',
    headers: ['순위', '회원 이름', '휴대폰 뒷번호', '총 사용 시간', '이달 결제금액', '증감률'],
    rows: [
      [1, '김태형', '6712', '1146시간 9분', '570,400', { value: -27, type: 'down' }],
      [2, '김장현', '6830', '613시간 34분', '426,500', { value: -38, type: 'down' }],
      [3, '김*빈', '4136', '169시간 53분', '306,200', { value: 131, type: 'up' }],
      [4, '노세리', '3105', '219시간 36분', '287,600', { value: -22, type: 'down' }],
      [5, '채수진', '9244', '99시간 45분', '287,500', { value: 367, type: 'up' }],
    ]
  }
};

// --- Helper Components & Functions ---

// 증감률 표시 컴포넌트
const ChangeIndicator = ({ value, type }) => {
  const color = type === 'up' ? '#e53e3e' : '#3182ce';
  const symbol = type === 'up' ? '▲' : '▼';
  return (
    <span style={{ color, whiteSpace: 'nowrap' }}>
      {symbol} {Math.abs(value)}%
    </span>
  );
};

// --- Main Components ---

const FilterHeader = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <div style={{ display: 'flex', gap: '5px' }}>
      {['월 분석', '일 분석', '쿠폰', '미션', '대회', '업적'].map((tab, i) => (
        <button key={tab} style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: i === 0 ? '#3182ce' : '#fff',
          color: i === 0 ? '#fff' : '#333',
          cursor: 'pointer'
        }}>{tab}</button>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input type="text" readOnly value="2025년 06월" style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}/>
      <button style={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        background: '#3182ce',
        color: '#fff',
        cursor: 'pointer'
      }}>월 분석하기</button>
    </div>
  </div>
);

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
