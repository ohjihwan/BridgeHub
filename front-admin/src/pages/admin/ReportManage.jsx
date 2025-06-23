import React, { useState } from 'react';
import '../../assets/scss/ReportManage.scss';

const dummyReports = [
  { 
    id: 1, 
    reporterId: 'user001',
    reporter: '이민우', 
    targetId: 'user002',
    target: '오지환', 
    reportType: '채팅방',
    reason: '욕설',
    date: '2024-01-15 14:30:25',
    status: 'pending',
    description: '스터디 그룹에서 지속적인 욕설 사용',
    chatRoomName: '프로그래밍 스터디 A',
    messageContent: '너 정말 바보같이 행동하네. 이런 식으로 하면 안 되잖아.',
    reportContent: '지속적으로 다른 멤버들을 비하하는 발언을 하고 있습니다.',
    penalty: '',
    penaltyType: '',
    adminNote: ''
  },
  { 
    id: 2, 
    reporterId: 'user003',
    reporter: '노현지', 
    targetId: 'user001',
    target: '이민우', 
    reportType: '게시글',
    reason: '스팸',
    date: '2024-01-14 09:15:42',
    status: 'resolved',
    description: '과도한 광고성 메시지 발송',
    chatRoomName: '',
    messageContent: '',
    reportContent: '동일한 광고 내용을 여러 게시글에 반복적으로 올리고 있습니다.',
    penalty: '게시글 작성 제한 7일',
    penaltyType: '게시글 제한',
    adminNote: '광고성 게시글 반복 등록으로 인한 제재'
  },
  { 
    id: 3, 
    reporterId: 'user004',
    reporter: '김철수', 
    targetId: 'user005',
    target: '박영희', 
    reportType: '채팅방',
    reason: '부적절한 콘텐츠',
    date: '2024-01-13 16:45:18',
    status: 'pending',
    description: '부적절한 이미지 공유',
    chatRoomName: '취미 공유방',
    messageContent: '[이미지 첨부됨]',
    reportContent: '성인용 콘텐츠와 유사한 이미지를 공유했습니다.',
    penalty: '',
    penaltyType: '',
    adminNote: ''
  },
  { 
    id: 4, 
    reporterId: 'user006',
    reporter: '최영희', 
    targetId: 'user007',
    target: '정민수', 
    reportType: '채팅방',
    reason: '괴롭힘',
    date: '2024-01-12 11:20:33',
    status: 'resolved',
    description: '지속적인 괴롭힘 행위',
    chatRoomName: '영어 스터디 B',
    messageContent: '너는 항상 실수만 하네. 다른 사람들처럼 잘하지 못하나?',
    reportContent: '특정 멤버를 지속적으로 비하하고 괴롭히는 행위를 하고 있습니다.',
    penalty: '채팅 제한 30일',
    penaltyType: '채팅 제한',
    adminNote: '지속적인 괴롭힘 행위로 인한 중간 제재'
  },
  { 
    id: 5, 
    reporterId: 'user008',
    reporter: '한지민', 
    targetId: 'user009',
    target: '송혜교', 
    reportType: '게시글',
    reason: '저작권 침해',
    date: '2024-01-11 13:55:07',
    status: 'pending',
    description: '무단으로 저작물을 복사하여 게시',
    chatRoomName: '',
    messageContent: '',
    reportContent: '다른 사람의 저작물을 허가 없이 복사하여 게시했습니다.',
    penalty: '',
    penaltyType: '',
    adminNote: ''
  }
];

function ReportManage() {
  const [reports, setReports] = useState(dummyReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(filteredReports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReport(null);
  };

  const handleResolve = (reportId, penaltyType = '', penalty = '', adminNote = '') => {
    setReports(reports.map(report => 
      report.id === reportId ? { 
        ...report, 
        status: 'resolved',
        penaltyType,
        penalty,
        adminNote
      } : report
    ));
  };

  const handleResolveSelected = () => {
    setReports(reports.map(report => 
      selectedReports.includes(report.id) ? { ...report, status: 'resolved' } : report
    ));
    setSelectedReports([]);
  };

  const handleDelete = (reportId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 정말로 삭제하시겠습니까?`)) {
      setReports(reports.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: '대기중', class: 'status-pending' },
      resolved: { text: '처리완료', class: 'status-resolved' }
    };
    
    const config = statusConfig[status];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      '채팅방': { text: '채팅방', class: 'type-chat' },
      '게시글': { text: '게시글', class: 'type-post' }
    };
    
    const config = typeConfig[type];
    return <span className={`type-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="report-manage">
      <div className="report-header">
        <h2>신고관리</h2>
        <div className="report-actions">
          {selectedReports.length > 0 && (
            <>
              <button 
                className="btn btn-primary"
                onClick={handleResolveSelected}
              >
                선택 처리완료 ({selectedReports.length})
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteSelected}
              >
                선택 삭제 ({selectedReports.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="report-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="신고자ID, 피신고자ID, 이름, 사유로 검색..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select 
            value={statusFilter} 
            onChange={handleStatusFilter}
            className="status-filter"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="resolved">처리완료</option>
          </select>
        </div>
        <div className="filter-box">
          <select 
            value={typeFilter} 
            onChange={handleTypeFilter}
            className="type-filter"
          >
            <option value="all">전체 유형</option>
            <option value="채팅방">채팅방</option>
            <option value="채팅">채팅</option>
          </select>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>신고ID</th>
              <th>신고자ID</th>
              <th>신고자</th>
              <th>피신고자ID</th>
              <th>피신고자</th>
              <th>신고유형</th>
              <th>신고사유</th>
              <th>신고일시</th>
              <th>처리상태</th>
              <th>제재내용</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id} className={report.status === 'resolved' ? 'resolved' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleSelectReport(report.id)}
                  />
                </td>
                <td>#{report.id}</td>
                <td>{report.reporterId}</td>
                <td>{report.reporter}</td>
                <td>{report.targetId}</td>
                <td>{report.target}</td>
                <td>{getTypeBadge(report.reportType)}</td>
                <td>{report.reason}</td>
                <td>{report.date}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td className="penalty-cell">
                  {report.penalty ? (
                    <div className="penalty-info">
                      <span className="penalty-type">{report.penaltyType}</span>
                      <span className="penalty-detail">{report.penalty}</span>
                    </div>
                  ) : (
                    <span className="no-penalty">-</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewDetail(report)}
                    >
                      상세보기
                    </button>
                    {report.status === 'pending' && (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleResolve(report.id)}
                      >
                        처리완료
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(report.id)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReports.length === 0 && (
          <div className="no-data">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {showDetail && selectedReport && (
        <div className="detail-modal-overlay" onClick={handleCloseDetail}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>신고 상세정보 - #{selectedReport.id}</h3>
              <button className="close-btn" onClick={handleCloseDetail}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h4>기본 정보</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>신고자 ID:</label>
                    <span>{selectedReport.reporterId}</span>
                  </div>
                  <div className="detail-item">
                    <label>신고자:</label>
                    <span>{selectedReport.reporter}</span>
                  </div>
                  <div className="detail-item">
                    <label>피신고자 ID:</label>
                    <span>{selectedReport.targetId}</span>
                  </div>
                  <div className="detail-item">
                    <label>피신고자:</label>
                    <span>{selectedReport.target}</span>
                  </div>
                  <div className="detail-item">
                    <label>신고유형:</label>
                    <span>{getTypeBadge(selectedReport.reportType)}</span>
                  </div>
                  <div className="detail-item">
                    <label>신고사유:</label>
                    <span>{selectedReport.reason}</span>
                  </div>
                  <div className="detail-item">
                    <label>신고일시:</label>
                    <span>{selectedReport.date}</span>
                  </div>
                  <div className="detail-item">
                    <label>처리상태:</label>
                    <span>{getStatusBadge(selectedReport.status)}</span>
                  </div>
                </div>
              </div>

              {selectedReport.chatRoomName && (
                <div className="detail-section">
                  <h4>채팅방 정보</h4>
                  <div className="detail-item">
                    <label>채팅방명:</label>
                    <span>{selectedReport.chatRoomName}</span>
                  </div>
                  {selectedReport.messageContent && (
                    <div className="detail-item">
                      <label>메시지 내용:</label>
                      <div className="message-content">{selectedReport.messageContent}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h4>신고 내용</h4>
                <div className="detail-item">
                  <label>신고 내용:</label>
                  <div className="report-content">{selectedReport.reportContent}</div>
                </div>
              </div>

              {selectedReport.status === 'resolved' && (
                <div className="detail-section">
                  <h4>처리 정보</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>제재항목:</label>
                      <span>{selectedReport.penaltyType || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <label>제재내용:</label>
                      <span>{selectedReport.penalty || '-'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>관리자 메모:</label>
                      <div className="admin-note">{selectedReport.adminNote || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <div className="detail-section">
                  <h4>처리하기</h4>
                  <div className="resolve-form">
                    <div className="form-group">
                      <label>제재항목:</label>
                      <select className="penalty-type-select">
                        <option value="">선택하세요</option>
                        <option value="경고">경고</option>
                        <option value="채팅 제한">채팅 제한</option>
                        <option value="게시글 제한">게시글 제한</option>
                        <option value="계정 정지">계정 정지</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>제재내용:</label>
                      <input type="text" className="penalty-input" placeholder="예: 채팅 제한 7일" />
                    </div>
                    <div className="form-group">
                      <label>관리자 메모:</label>
                      <textarea className="admin-note-input" placeholder="처리 사유를 입력하세요"></textarea>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-success">처리완료</button>
                      <button className="btn btn-secondary" onClick={handleCloseDetail}>취소</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportManage;
