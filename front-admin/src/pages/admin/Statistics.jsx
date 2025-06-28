import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { fetchStatistics, fetchMemberStatistics, fetchReportStatistics } from '../../services/api';

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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
      {chart.legend.map((label, index) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: chart.data.datasets[0].backgroundColor[index] }}></div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  </Card>
);

const ChangeIndicator = ({ value, type }) => (
  <span style={{ 
    color: type === 'up' ? '#22c55e' : '#ef4444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  }}>
    {type === 'up' ? '↗' : '↘'} {Math.abs(value)}%
  </span>
);

const ListCard = ({ title, items, renderItem }) => (
  <Card>
    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(renderItem)}
    </div>
  </Card>
);

export default function Statistics() {
  const [statistics, setStatistics] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('gender');

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const [statsResponse, memberResponse, reportResponse] = await Promise.all([
          fetchStatistics(),
          fetchMemberStatistics(),
          fetchReportStatistics()
        ]);
        
        setStatistics(statsResponse.data.data);
        setMemberStats(memberResponse.data.data);
        setReportStats(reportResponse.data.data);
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  // 차트 데이터 생성
  const generateChartData = () => {
    if (!memberStats) return [];

    const genderData = {
      id: 'gender',
      title: '성별',
      data: {
        labels: Object.keys(memberStats.gender || {}),
        datasets: [{ 
          data: Object.values(memberStats.gender || {}), 
          backgroundColor: ['#0043AC', '#FF9F40'] 
        }]
      },
      legend: Object.keys(memberStats.gender || {})
    };

    const educationData = {
      id: 'education',
      title: '학력',
      data: {
        labels: Object.keys(memberStats.education || {}),
        datasets: [{ 
          data: Object.values(memberStats.education || {}), 
          backgroundColor: ['#0043AC', '#36A2EB', '#FF9F40'] 
        }]
      },
      legend: Object.keys(memberStats.education || {})
    };

    const timeData = {
      id: 'time',
      title: '활동 시간대',
      data: {
        labels: Object.keys(memberStats.time || {}),
        datasets: [{ 
          data: Object.values(memberStats.time || {}), 
          backgroundColor: ['#0043AC', '#36A2EB', '#FF9F40'] 
        }]
      },
      legend: Object.keys(memberStats.time || {})
    };

    const majorData = {
      id: 'major',
      title: '전공',
      data: {
        labels: Object.keys(memberStats.major || {}),
        datasets: [{ 
          data: Object.values(memberStats.major || {}), 
          backgroundColor: ['#0043AC', '#36A2EB', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#DE7C7D'] 
        }]
      },
      legend: Object.keys(memberStats.major || {})
    };

    return [genderData, educationData, timeData, majorData];
  };

  const chartDataList = generateChartData();
  const activeChartData = chartDataList.find(chart => chart.id === activeChart) || chartDataList[0];

  // 요약 카드 데이터
  const summaryCards = [
    {
      title: '총 회원 수',
      description: '전체 등록된 회원 수',
      value: statistics?.memberStats?.totalMembers || 0,
      change: 5.2
    },
    {
      title: '활성 회원',
      description: '현재 활성 상태인 회원 수',
      value: statistics?.memberStats?.activeMembers || 0,
      change: 2.1
    },
    {
      title: '총 신고 수',
      description: '전체 신고 건수',
      value: statistics?.reportStats?.totalReports || 0,
      change: -1.5
    },
    {
      title: '대기 신고',
      description: '처리 대기 중인 신고 수',
      value: statistics?.reportStats?.pendingReports || 0,
      change: 3.2
    }
  ];

  // 분기별 데이터
  const quarterlyData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '신규 가입자 수',
        data: Object.values(statistics?.activityStats?.quarterlySignups || {}),
        backgroundColor: '#0043AC'
      },
      {
        label: '총 접속자 수',
        data: Object.values(statistics?.activityStats?.quarterlyVisitors || {}),
        backgroundColor: '#FF9F40'
      }
    ]
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#333' }}>통계 대시보드</h1>
      
      {/* 요약 카드들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} data={card} />
        ))}
      </div>

      {/* 차트 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '30px' }}>
        {/* 미니 차트들 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {chartDataList.map(chart => (
            <MiniChartCard
              key={chart.id}
              chart={chart}
              isActive={activeChart === chart.id}
              onClick={() => setActiveChart(chart.id)}
            />
          ))}
        </div>

        {/* 메인 차트 */}
        <Card>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#555' }}>
            {activeChartData?.title || '통계'} 분포
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut 
              data={activeChartData?.data || { labels: [], datasets: [] }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </Card>
      </div>

      {/* 분기별 트렌드 */}
      <Card style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#555' }}>분기별 트렌드</h3>
        <div style={{ height: '300px' }}>
          <Bar 
            data={quarterlyData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                }
              }
            }} 
          />
        </div>
      </Card>

      {/* 최근 신고 및 인기 방 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ListCard
          title="최근 신고"
          items={statistics?.reportStats?.recentReports || []}
          renderItem={(report, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <div>
                <div style={{ fontWeight: '500' }}>#{report.id}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{report.reason}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        />

        <ListCard
          title="인기 채팅방"
          items={statistics?.activityStats?.popularRooms || []}
          renderItem={(room, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontWeight: '500' }}>{room.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{room.count}명</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}