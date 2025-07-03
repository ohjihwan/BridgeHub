import React, { useState, useEffect } from 'react';
import '../../assets/scss/ReportManage.scss';
import { fetchReports, resolveReport, deleteReport } from '../../services/api';

function ReportManage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // 실제 API로 신고 목록 불러오기
  useEffect(() => {
    loadReports();
  }, [paginationModel]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetchReports({ 
        page: paginationModel.page, 
        size: paginationModel.pageSize 
      });
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const content = Array.isArray(response.data?.data?.content) ? response.data.data.content : [];
      const reportsData = content.map(report => ({
        id: report.reportId,
        reporterId: report.reporterId,
        reporter: report.reporterName || `사용자${report.reporterId}`,
        targetId: report.reportedUserId,
        target: report.reportedUserName || `사용자${report.reportedUserId}`,
        reportType: report.reportType,
        reason: report.reason,
        date: report.createdAt ? new Date(report.createdAt).toLocaleString() : '',
        status: report.status,
        description: report.reason,
        chatRoomName: report.roomName || '',
        messageContent: report.messageContent || '',
        reportContent: report.reason,
        penalty: report.penalty || '',
        penaltyType: report.penaltyType || '',
        adminNote: report.adminComment || ''
      }));
      
      setReports(reportsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleResolve = async (reportId, penaltyType = '', penalty = '', adminNote = '') => {
    try {
      await resolveReport(reportId, {
        penaltyType,
        penalty,
        adminNote
      });
      
      // 목록 새로고침
      loadReports();
      alert('신고가 처리되었습니다.');
    } catch (err) {
      alert('신고 처리에 실패했습니다: ' + err.message);
    }
  };

  const handleResolveSelected = async () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 처리하시겠습니까?`)) {
      try {
        for (const reportId of selectedReports) {
          await resolveReport(reportId, {
            penaltyType: '경고',
            penalty: '경고 조치',
            adminNote: '일괄 처리'
          });
        }
        
        setSelectedReports([]);
        loadReports();
        alert('선택된 신고들이 처리되었습니다.');
      } catch (err) {
        alert('신고 처리에 실패했습니다: ' + err.message);
      }
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteReport(reportId);
        // 목록 새로고침
        loadReports();
        alert('신고가 삭제되었습니다.');
      } catch (err) {
        alert('신고 삭제에 실패했습니다: ' + err.message);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        for (const reportId of selectedReports) {
          await deleteReport(reportId);
        }
        
        setSelectedReports([]);
        loadReports();
        alert('선택된 신고들이 삭제되었습니다.');
      } catch (err) {
        alert('신고 삭제에 실패했습니다: ' + err.message);
      }
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterId.toString().includes(searchTerm) ||
      report.targetId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { text: '대기중', class: 'status-pending' },
      PROCESSING: { text: '처리중', class: 'status-processing' },
      RESOLVED: { text: '처리완료', class: 'status-resolved' },
      REJECTED: { text: '거절됨', class: 'status-rejected' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // 신고 처리 폼 컴포넌트
  const ReportResolutionForm = ({ reportId, onResolve, onCancel }) => {
    const [penaltyType, setPenaltyType] = useState('');
    const [penalty, setPenalty] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!penaltyType || !penalty) {
        alert('처리 유형과 처리 내용을 입력해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        await onResolve(reportId, penaltyType, penalty, adminNote);
        onCancel(); // 폼 닫기
      } catch (error) {
        console.error('신고 처리 실패:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="resolution-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="penaltyType">처리 유형</label>
            <select
              id="penaltyType"
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="form-select"
              required
            >
              <option value="">처리 유형 선택</option>
              <option value="경고">경고</option>
              <option value="일시정지">일시정지</option>
              <option value="영구정지">영구정지</option>
              <option value="무혐의">무혐의</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="penalty">처리 내용</label>
            <input
              type="text"
              id="penalty"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              className="form-input"
              placeholder="처리 내용을 입력하세요"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="adminNote">관리자 코멘트</label>
          <textarea
            id="adminNote"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="form-textarea"
            placeholder="관리자 코멘트를 입력하세요 (선택사항)"
            rows="3"
          />
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="action-button cancel-button"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="action-button submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '신고 처리'}
          </button>
        </div>
      </form>
    );
  };

  if (error) {
    return (
      <div className="report-manage">
        <div className="report-header">
          <h2>신고관리</h2>
        </div>
        <div style={{ 
          color: 'red', 
          padding: '20px', 
          textAlign: 'center',
          background: '#fff',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          에러: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="report-manage">
      <div className="report-header">
        <h2>신고관리</h2>
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="신고자, 대상자, 사유로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select value={statusFilter} onChange={handleStatusFilter} className="status-filter">
              <option value="all">전체 상태</option>
              <option value="PENDING">대기중</option>
              <option value="PROCESSING">처리중</option>
              <option value="RESOLVED">처리완료</option>
              <option value="REJECTED">거절됨</option>
            </select>
          </div>
          <div className="filter-box">
            <select value={typeFilter} onChange={handleTypeFilter} className="type-filter">
              <option value="all">전체 유형</option>
              <option value="USER">사용자</option>
              <option value="MESSAGE">메시지</option>
              <option value="STUDYROOM">스터디룸</option>
              <option value="INAPPROPRIATE_CONTENT">부적절한 콘텐츠</option>
            </select>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <div className="bulk-actions">
          <button 
            onClick={handleResolveSelected} 
            disabled={selectedReports.length === 0}
            className="action-button resolve-button"
          >
            선택 처리 ({selectedReports.length})
          </button>
          <button 
            onClick={handleDeleteSelected} 
            disabled={selectedReports.length === 0}
            className="action-button delete-button"
          >
            선택 삭제 ({selectedReports.length})
          </button>
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
              <th>신고 ID</th>
              <th>신고자</th>
              <th>대상자</th>
              <th>신고 유형</th>
              <th>사유</th>
              <th>신고일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  신고 데이터를 불러오는 중...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  표시할 신고가 없습니다.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                    />
                  </td>
                  <td>#{report.id}</td>
                  <td>{report.reporter}</td>
                  <td>{report.target}</td>
                  <td>{report.reportType}</td>
                  <td>{report.reason}</td>
                  <td>{report.date}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewDetail(report)}
                        className="detail-button"
                      >
                        상세
                      </button>
                      {report.status === 'PENDING' && (
                        <button 
                          onClick={() => handleResolve(report.id)}
                          className="resolve-button"
                        >
                          처리
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 보기 모달 */}
      {showDetail && selectedReport && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-content">
                <h3>신고 상세 정보</h3>
                <div className="report-id-badge">#{selectedReport.id}</div>
              </div>
              <button onClick={handleCloseDetail} className="close-button">✕</button>
            </div>
            
            <div className="modal-body">
              {/* 상태 표시줄 */}
              <div className="status-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot active"></div>
                  <span>신고 접수</span>
                </div>
                <div className="timeline-line"></div>
                <div className="timeline-item">
                  <div className={`timeline-dot ${selectedReport.status !== 'PENDING' ? 'active' : ''}`}></div>
                  <span>검토 중</span>
                </div>
                <div className="timeline-line"></div>
                <div className="timeline-item">
                  <div className={`timeline-dot ${selectedReport.status === 'RESOLVED' ? 'active' : ''}`}></div>
                  <span>처리 완료</span>
                </div>
              </div>

              {/* 신고 개요 카드 */}
              <div className="info-card overview-card">
                <div className="card-header">
                  <h4>신고 개요</h4>
                  <div className="status-badge-large">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">신고 유형</div>
                      <div className="info-value type-badge">{selectedReport.reportType}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">신고일시</div>
                      <div className="info-value">{selectedReport.date}</div>
                    </div>
                    <div className="info-item full-width">
                      <div className="info-label">신고 사유</div>
                      <div className="info-value reason-text">{selectedReport.reason}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 관련 사용자 정보 카드 */}
              <div className="info-card users-card">
                <div className="card-header">
                  <h4>관련 사용자</h4>
                </div>
                <div className="card-content">
                  <div className="users-grid">
                    <div className="user-item reporter">
                      <div className="user-avatar">신고자</div>
                      <div className="user-info">
                        <div className="user-role">신고자</div>
                        <div className="user-name">{selectedReport.reporter}</div>
                        <div className="user-id">ID: {selectedReport.reporterId}</div>
                      </div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="user-item target">
                      <div className="user-avatar">대상자</div>
                      <div className="user-info">
                        <div className="user-role">신고 대상</div>
                        <div className="user-name">{selectedReport.target}</div>
                        <div className="user-id">ID: {selectedReport.targetId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 채팅방 정보 카드 (있을 경우) */}
              {selectedReport.chatRoomName && (
                <div className="info-card chat-card">
                  <div className="card-header">
                    <h4>채팅방 정보</h4>
                  </div>
                  <div className="card-content">
                    <div className="chat-info">
                      <div className="chat-room-name">{selectedReport.chatRoomName}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 신고된 메시지 카드 (있을 경우) */}
              {selectedReport.messageContent && (
                <div className="info-card message-card">
                  <div className="card-header">
                    <h4>신고된 메시지</h4>
                  </div>
                  <div className="card-content">
                    <div className="message-bubble">
                      <div className="message-content">
                        {selectedReport.messageContent}
                      </div>
                      <div className="message-meta">
                        <span className="message-author">{selectedReport.target}</span>
                        <span className="message-time">{selectedReport.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 신고 상세 내용 카드 */}
              <div className="info-card report-content-card">
                <div className="card-header">
                  <h4>신고 상세 내용</h4>
                </div>
                <div className="card-content">
                  <div className="report-description">
                    {selectedReport.reportContent}
                  </div>
                </div>
              </div>

              {/* 처리 결과 카드 (처리 완료된 경우) */}
              {selectedReport.status === 'RESOLVED' && (
                <div className="info-card resolution-card">
                  <div className="card-header">
                    <h4>처리 결과</h4>
                  </div>
                  <div className="card-content">
                    <div className="resolution-grid">
                      <div className="resolution-item">
                        <div className="info-label">처리 유형</div>
                        <div className="info-value penalty-type">{selectedReport.penaltyType}</div>
                      </div>
                      <div className="resolution-item">
                        <div className="info-label">처리 내용</div>
                        <div className="info-value penalty-detail">{selectedReport.penalty}</div>
                      </div>
                      <div className="resolution-item full-width">
                        <div className="info-label">관리자 코멘트</div>
                        <div className="info-value admin-comment">
                          {selectedReport.adminNote || '코멘트가 없습니다.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 신고 처리 폼 (대기 중인 경우) */}
              {selectedReport.status === 'PENDING' && (
                <div className="info-card action-card">
                  <div className="card-header">
                    <h4>신고 처리</h4>
                  </div>
                  <div className="card-content">
                    <ReportResolutionForm 
                      reportId={selectedReport.id}
                      onResolve={handleResolve}
                      onCancel={handleCloseDetail}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="footer-actions">
                {selectedReport.status === 'PENDING' && (
                  <button 
                    onClick={() => handleResolve(selectedReport.id)}
                    className="action-button resolve-button"
                  >
                    신고 처리
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(selectedReport.id)}
                  className="action-button delete-button"
                >
                  삭제
                </button>
                <button onClick={handleCloseDetail} className="action-button close-button">
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportManage;