import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { fetchStatistics } from '../../services/api';

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

// ChangeIndicator 컴포넌트 추가
const ChangeIndicator = ({ value, type }) => (
  <span style={{ 
    color: type === 'up' ? '#10b981' : '#ef4444',
    fontSize: '12px',
    fontWeight: '500'
  }}>
    {type === 'up' ? '↗' : '↘'} {Math.abs(value)}%
  </span>
);

// --- Main Statistics Component ---
export default function Statistics() {
  const [selectedChart, setSelectedChart] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataIntegrityWarnings, setDataIntegrityWarnings] = useState([]);

  useEffect(() => {
    setLoading(true);
    console.log('통계 데이터 로딩 시작...');
    fetchStatistics()
      .then(res => {
        console.log('통계 API 응답:', res);
        const apiResponse = res.data;
        console.log('파싱된 API 응답:', apiResponse);
        
        // API 응답 구조 확인: { success: true, data: { memberStats: {...} } }
        const actualData = apiResponse.data || apiResponse;
        console.log('실제 통계 데이터:', actualData);
        
        // 데이터베이스 값과 프론트엔드 기대값 매핑
        const mappedData = mapStatisticsData(actualData);
        console.log('매핑된 데이터:', mappedData);
        
        // 🔍 활동 시간대 상세 분석
        if (mappedData.memberStats?.time) {
          const timeTotal = Object.values(mappedData.memberStats.time).reduce((a, b) => a + b, 0);
          const activityTotal = mappedData.activityStats?.totalRegisteredMembers || 0;
          console.log('🕐 시간대 분석:', {
            '시간대별_인원': mappedData.memberStats.time,
            '시간대_총합': timeTotal,
            '전체_회원수': activityTotal,
            '차이': activityTotal - timeTotal
          });
        }
        
        // 데이터 무결성 체크
        const warnings = checkDataIntegrity(mappedData);
        setDataIntegrityWarnings(warnings);
        
        setStats(mappedData);
        
        // 첫 번째 차트를 기본 선택
        if (mappedData.memberStats && Object.keys(mappedData.memberStats).length > 0) {
          const firstChartKey = Object.keys(mappedData.memberStats)[0];
          console.log('첫 번째 차트 키:', firstChartKey);
          setSelectedChart({
            id: firstChartKey,
            title: getChartTitle(firstChartKey),
            data: buildChartData(firstChartKey, mappedData.memberStats[firstChartKey]),
            legend: getChartLegend(firstChartKey, mappedData.memberStats[firstChartKey])
          });
        } else {
          console.log('memberStats가 없거나 비어있음:', mappedData.memberStats);
        }
      })
      .catch(err => {
        console.error('통계 데이터 로딩 에러:', err);
        setError(err);
      })
      .finally(() => {
        console.log('통계 데이터 로딩 완료');
        setLoading(false);
      });
  }, []);

  const getChartTitle = (key) => {
    const titles = {
      gender: '성별',
      education: '학력',
      time: '활동 시간대',
      major: '전공'
    };
    return titles[key] || key;
  };

  const getChartLegend = (key, data) => {
    if (key === 'gender') {
      return ['남성', '여성'];
    } else if (key === 'education') {
      return ['고졸', '대학교', '대학원'];
    } else if (key === 'time') {
      return ['오전', '오후', '저녁'];
    } else if (key === 'major') {
      return ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합'];
    }
    return Object.keys(data);
  };

  const buildChartData = (key, data) => {
    const labels = getChartLegend(key, data);
    const values = labels.map(label => data[label] || 0);
    
    let colors;
    if (key === 'gender') {
      colors = ['#0043AC', '#FF9F40'];
    } else if (key === 'education') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40'];
    } else if (key === 'time') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40'];
    } else if (key === 'major') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#DE7C7D'];
    } else {
      colors = ['#0043AC', '#36A2EB', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#DE7C7D'];
    }

    return {
      labels,
      datasets: [{ data: values, backgroundColor: colors }]
    };
  };

  const buildBarData = () => {
    if (!stats?.activityStats?.quarterlySignups) return null;
    
    const dates = Object.keys(stats.activityStats.quarterlySignups).sort();
    // 날짜 형식을 간단하게 표시 (MM-DD)
    const formattedLabels = dates.map(date => {
      const d = new Date(date);
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    });
    
    return {
      labels: formattedLabels,
      datasets: [
        {
          label: '일별 신규가입자',
          data: dates.map(d => stats.activityStats.quarterlySignups[d]),
          backgroundColor: '#6a6cff'
        }
      ]
    };
  };

  // 데이터베이스 값을 프론트엔드 기대값으로 매핑하는 함수
  const mapStatisticsData = (data) => {
    const mappedData = { ...data };
    
    if (data.memberStats) {
      const memberStats = {};
      
      // 성별 데이터 매핑
      if (data.memberStats.gender) {
        memberStats.gender = {};
        Object.entries(data.memberStats.gender).forEach(([key, value]) => {
          if (key === '남자' || key === '남성') {
            memberStats.gender['남성'] = value;
          } else if (key === '여자' || key === '여성') {
            memberStats.gender['여성'] = value;
          } else {
            memberStats.gender[key] = value;
          }
        });
      }
      
      // 학력 데이터 매핑 (그대로 사용)
      if (data.memberStats.education) {
        memberStats.education = { ...data.memberStats.education };
      }
      
      // 시간대 데이터 매핑
      if (data.memberStats.time) {
        // 먼저 원본 데이터를 콘솔에 출력하여 디버깅
        console.log('시간대 원본 데이터:', data.memberStats.time);
        
        memberStats.time = {};
        Object.entries(data.memberStats.time).forEach(([key, value]) => {
          console.log(`시간대 매핑: ${key} = ${value}`);
          
          // 데이터베이스에서 오는 값을 표준 시간대로 매핑
          if (key === '새벽' || key === '오전') {
            memberStats.time['오전'] = (memberStats.time['오전'] || 0) + value;
          } else if (key === '낮' || key === '오후') {
            memberStats.time['오후'] = (memberStats.time['오후'] || 0) + value;
          } else if (key === '밤' || key === '저녁' || key === '야간') {
            memberStats.time['저녁'] = (memberStats.time['저녁'] || 0) + value;
          } else {
            // 알 수 없는 시간대는 기타로 처리하거나 로그 출력
            console.warn(`알 수 없는 시간대: ${key} = ${value}`);
            // 일단 저녁으로 분류
            memberStats.time['저녁'] = (memberStats.time['저녁'] || 0) + value;
          }
        });
        
        console.log('매핑된 시간대 데이터:', memberStats.time);
      }
      
      // 전공 데이터 매핑
      if (data.memberStats.major) {
        memberStats.major = {};
        Object.entries(data.memberStats.major).forEach(([key, value]) => {
          // 데이터베이스의 개별 전공을 그룹화
          if (key === '인문' || key === '사회' || key === '문학' || key === '역사' || key === '철학') {
            memberStats.major['인문•사회'] = (memberStats.major['인문•사회'] || 0) + value;
          } else if (key === '경영' || key === '경제' || key === '회계' || key === '금융') {
            memberStats.major['상경'] = (memberStats.major['상경'] || 0) + value;
          } else if (key === '수학' || key === '물리' || key === '화학' || key === '생물' || key === '지구과학') {
            memberStats.major['자연'] = (memberStats.major['자연'] || 0) + value;
          } else if (key === '컴퓨터' || key === '전자' || key === '기계' || key === '건축' || key === '토목') {
            memberStats.major['공학'] = (memberStats.major['공학'] || 0) + value;
          } else if (key === '음악' || key === '미술' || key === '체육' || key === '디자인') {
            memberStats.major['예체능'] = (memberStats.major['예체능'] || 0) + value;
          } else if (key === '의학' || key === '치의학' || key === '한의학' || key === '약학') {
            memberStats.major['의학'] = (memberStats.major['의학'] || 0) + value;
          } else if (key === '법학') {
            memberStats.major['법학'] = (memberStats.major['법학'] || 0) + value;
          } else {
            // 기타 또는 융합 전공
            memberStats.major['융합'] = (memberStats.major['융합'] || 0) + value;
          }
        });
      }
      
      mappedData.memberStats = memberStats;
    }
    
    return mappedData;
  };

  // 데이터 무결성 체크 함수 (새로 추가)
  const checkDataIntegrity = (data) => {
    const warnings = [];
    
    if (!data.memberStats || !data.activityStats) {
      return warnings;
    }
    
    // 총 회원 수 계산
    const totalFromActivity = data.activityStats.totalRegisteredMembers || data.activityStats.totalVisitors || 0;
    const totalFromGender = data.memberStats.gender ? Object.values(data.memberStats.gender).reduce((a, b) => a + b, 0) : 0;
    const totalFromTime = data.memberStats.time ? Object.values(data.memberStats.time).reduce((a, b) => a + b, 0) : 0;
    const totalFromEducation = data.memberStats.education ? Object.values(data.memberStats.education).reduce((a, b) => a + b, 0) : 0;
    const totalFromMajor = data.memberStats.major ? Object.values(data.memberStats.major).reduce((a, b) => a + b, 0) : 0;
    
    console.log('데이터 무결성 체크:', {
      totalFromActivity,
      totalFromGender,
      totalFromTime,
      totalFromEducation,
      totalFromMajor
    });
    
    // 불일치 체크
    if (totalFromActivity !== totalFromGender && totalFromGender > 0) {
      warnings.push(`성별 통계 합계(${totalFromGender}명)와 총 회원 수(${totalFromActivity}명)가 일치하지 않습니다.`);
    }
    
    if (totalFromActivity !== totalFromTime && totalFromTime > 0) {
      warnings.push(`활동 시간대 통계 합계(${totalFromTime}명)와 총 회원 수(${totalFromActivity}명)가 일치하지 않습니다. 일부 회원이 활동 시간대를 설정하지 않았을 수 있습니다.`);
    }
    
    if (totalFromActivity !== totalFromEducation && totalFromEducation > 0) {
      warnings.push(`학력 통계 합계(${totalFromEducation}명)와 총 회원 수(${totalFromActivity}명)가 일치하지 않습니다.`);
    }
    
    if (totalFromActivity !== totalFromMajor && totalFromMajor > 0) {
      warnings.push(`전공 통계 합계(${totalFromMajor}명)와 총 회원 수(${totalFromActivity}명)가 일치하지 않습니다.`);
    }
    
    return warnings;
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      fontSize: '16px',
      color: '#666'
    }}>
      통계 데이터를 불러오는 중...
    </div>
  );

  if (error) return (
    <div style={{ 
      color: 'red', 
      padding: '20px',
      textAlign: 'center'
    }}>
      에러: {error.message}
    </div>
  );

  if (!stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        통계 데이터가 없습니다.
      </div>
    );
  }

  // 데이터가 비어있는지 확인
  const hasMemberStats = stats.memberStats && Object.keys(stats.memberStats).length > 0;
  const hasActivityStats = stats.activityStats && Object.keys(stats.activityStats).length > 0;
  const hasReportStats = stats.reportStats && Object.keys(stats.reportStats).length > 0;

  if (!hasMemberStats && !hasActivityStats && !hasReportStats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        표시할 통계 데이터가 없습니다.
      </div>
    );
  }

  const chartDataList = Object.keys(stats.memberStats || {}).map(key => ({
    id: key,
    title: getChartTitle(key),
    data: buildChartData(key, stats.memberStats[key]),
    legend: getChartLegend(key, stats.memberStats[key])
  }));

  const barData = buildBarData();

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
            isActive={selectedChart?.id === chart.id}
            onClick={() => setSelectedChart(chart)}
          />
        ))}
      </div>

      {/* 메인 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* 핵심 지표 요약 카드들 */}
        <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          {/* 총 회원 수 */}
          <Card>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>총 회원 수</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {stats.activityStats?.totalRegisteredMembers || stats.activityStats?.totalVisitors || 
               (stats.memberStats ? Object.values(stats.memberStats.gender || {}).reduce((a, b) => a + b, 0) : 0)}명
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>플랫폼 가입 회원</p>
          </Card>
          

          
          {/* 신고 수 */}
          <Card>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>신고 수</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#e53e3e' }}>
              {stats.reportStats?.reportTypes ? 
                Object.values(stats.reportStats.reportTypes).reduce((total, value) => {
                  return total + (typeof value === 'number' ? value : 0);
                }, 0) : 0}건
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>전체 신고 건수</p>
          </Card>
          
          {/* 활성 스터디룸 */}
          <Card>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>활성 스터디룸</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.activityStats?.activeStudyRooms?.length || 0}개
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>사용자 참여 중</p>
          </Card>
        </div>
        
        {/* 선택된 차트 상세 */}
        {selectedChart && (
          <Card style={{ gridColumn: 'span 1' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#555' }}>{selectedChart.title} 상세</h3>
            <div style={{ margin: '0 0 15px 0', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>통계 포함 인원:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                  {selectedChart.data.datasets[0].data.reduce((a, b) => a + b, 0)}명
                </span>
              </div>
            </div>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Doughnut data={selectedChart.data} options={{ plugins: { legend: { position: 'right' } } }} />
            </div>
          </Card>
        )}
        
        {/* 일별 신규가입자 수 바 차트 */}
        {barData && (
          <Card style={{ gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>일별 신규가입자 수</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>
              최근 30일간 일별 가입자 추이
            </p>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>
        )}
        
        {/* 하단 위젯들 - 모두 숨김 처리 */}
        {/* 활동 TOP 10 - 숨김 처리 */}
        {/* {stats.activityStats?.topActiveUsers && (
          <ListCard 
            title="활동 TOP 10"
            items={stats.activityStats.topActiveUsers}
            renderItem={user => (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{user.name}</span>
                <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{user.activity}회</span>
              </div>
            )}
          />
        )} */}
        
        {/* 인기 채팅방 TOP 10 - 숨김 처리 */}
        {/* {stats.activityStats?.popularRooms && (
          <ListCard
            title="인기 채팅방 TOP 10"
            items={stats.activityStats.popularRooms}
            renderItem={room => (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{room.name}</span>
                <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{room.count}명</span>
              </div>
            )}
          />
        )} */}
        
        {/* 실시간 접속자 정보 - 숨김 처리 */}
        {/* {stats.activityStats && (
          <div style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>실시간 현황</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>👥 총 회원 수</span>
                <span style={{ fontWeight: 'bold', color: '#2196F3', fontSize: '18px' }}>
                  {stats.activityStats.totalRegisteredMembers || stats.activityStats.totalVisitors || 0}명
                </span>
              </div>
              {stats.activityStats.activeStudyRooms && stats.activityStats.activeStudyRooms.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>📚 활성 스터디룸</span>
                  <span style={{ fontWeight: 'bold', color: '#FF6900', fontSize: '18px' }}>
                    {stats.activityStats.activeStudyRooms.length}개
                  </span>
                </div>
              )}
            </div>
          </div>
        )} */}
        
        {/* 활성 스터디룸 목록 - 숨김 처리 */}
        {/* {stats.activityStats?.activeStudyRooms && stats.activityStats.activeStudyRooms.length > 0 && (
          <ListCard 
            title="현재 활성 스터디룸"
            items={stats.activityStats.activeStudyRooms}
            renderItem={room => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>{room.roomTitle}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    background: '#e3f2fd', 
                    color: '#1976d2', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {room.currentUsers}/{room.maxCapacity}
                  </span>
                  <span style={{ color: '#666', fontSize: '14px' }}>👥</span>
                </div>
              </div>
            )}
          />
        )} */}
        
        {/* 최근 신고 TOP 10 - 숨김 처리 */}
        {/* {stats.reportStats?.recentReports && (
          <ListCard
            title="최근 신고 TOP 10"
            items={stats.reportStats.recentReports}
            renderItem={report => (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>{report.reporter} → {report.target}</span>
                <span style={{ color: '#888' }}>({report.reason})</span>
              </div>
            )}
          />
        )} */}
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