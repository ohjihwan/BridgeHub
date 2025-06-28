import React, { useState, useEffect } from 'react';
import '../../assets/scss/ReportManage.scss';
import { fetchReports, resolveReport } from '../../services/api';

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
  const [totalRows, setTotalRows] = useState(0);

  const loadReports = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await fetchReports({ page, size });
      const data = response.data.data;
      setReports((data.content || []).map(report => ({
        ...report,
        id: report.id || report.report_id
      })));
      setTotalRows(data.totalElements || 0);
    } catch (err) {
      console.error('신고 데이터 로드 실패:', err);
      setError('신고 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel]);

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
      await resolveReport(reportId, { penaltyType, penalty, adminNote });
      // 목록 새로고침
      loadReports(paginationModel.page, paginationModel.pageSize);
      alert('신고가 처리되었습니다.');
    } catch (err) {
      console.error('신고 처리 실패:', err);
      alert('신고 처리에 실패했습니다.');
    }
  };

  const handleResolveSelected = async () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 처리하시겠습니까?`)) {
      try {
        for (const reportId of selectedReports) {
          await resolveReport(reportId, { penaltyType: '경고', penalty: '경고', adminNote: '일괄 처리' });
        }
        setSelectedReports([]);
        loadReports(paginationModel.page, paginationModel.pageSize);
        alert('선택된 신고들이 처리되었습니다.');
      } catch (err) {
        console.error('일괄 신고 처리 실패:', err);
        alert('신고 처리에 실패했습니다.');
      }
    }
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
      (report.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.reportedUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.reporterId || '').toString().includes(searchTerm.toLowerCase()) ||
      (report.reportedUserId || '').toString().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { text: '대기중', class: 'status-pending' },
      RESOLVED: { text: '처리완료', class: 'status-resolved' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      CHAT: { text: '채팅방', class: 'type-chat' },
      POST: { text: '게시글', class: 'type-post' },
      USER: { text: '사용자', class: 'type-user' }
    };
    
    const config = typeConfig[type] || { text: type, class: 'type-chat' };
    return <span className={`type-badge ${config.class}`}>{config.text}</span>;
  };

  if (error) {
    return (
      <div className="report-manage">
        <div className="report-header">
          <h2>신고관리</h2>
        </div>
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="report-manage">
      <div className="report-header">
        <h2>신고관리</h2>
        <div className="report-controls">
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
            <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
              <option value="all">전체 상태</option>
              <option value="PENDING">대기중</option>
              <option value="RESOLVED">처리완료</option>
            </select>
            <select value={typeFilter} onChange={handleTypeFilter} className="filter-select">
              <option value="all">전체 유형</option>
              <option value="CHAT">채팅방</option>
              <option value="POST">게시글</option>
              <option value="USER">사용자</option>
            </select>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <div className="bulk-actions">
          <label>
            <input
              type="checkbox"
              checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
              onChange={handleSelectAll}
            />
            전체 선택
          </label>
          {selectedReports.length > 0 && (
            <>
              <button onClick={handleResolveSelected} className="action-btn resolve-btn">
                선택 처리 ({selectedReports.length})
              </button>
              <button onClick={handleDeleteSelected} className="action-btn delete-btn">
                선택 삭제 ({selectedReports.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="report-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>선택</th>
                <th>신고ID</th>
                <th>신고자</th>
                <th>대상자</th>
                <th>유형</th>
                <th>사유</th>
                <th>신고일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => (
                <tr key={report.id || `report-${index}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                    />
                  </td>
                  <td>#{report.id || 'N/A'}</td>
                  <td>{report.reporterName || report.reporterId || 'N/A'}</td>
                  <td>{report.reportedUserName || report.reportedUserId || 'N/A'}</td>
                  <td>{getTypeBadge(report.reportType)}</td>
                  <td>{report.reason || 'N/A'}</td>
                  <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetail(report)}
                        className="action-btn view-btn"
                      >
                        상세보기
                      </button>
                      {report.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleResolve(report.id)}
                            className="action-btn resolve-btn"
                            disabled={!report.id}
                          >
                            처리
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="action-btn delete-btn"
                            disabled={!report.id}
                          >
                            삭제
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="action-btn resolve-btn" disabled>처리</button>
                          <button className="action-btn delete-btn" disabled>삭제</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 신고 상세 모달 */}
      {showDetail && selectedReport && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>신고 상세 정보</h3>
              <button onClick={handleCloseDetail} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>기본 정보</h4>
                <p><strong>신고 ID:</strong> #{selectedReport.id}</p>
                <p><strong>신고자:</strong> {selectedReport.reporterName || selectedReport.reporterId}</p>
                <p><strong>대상자:</strong> {selectedReport.reportedUserName || selectedReport.reportedUserId}</p>
                <p><strong>신고 유형:</strong> {selectedReport.reportType}</p>
                <p><strong>신고 사유:</strong> {selectedReport.reason}</p>
                <p><strong>신고일:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                <p><strong>상태:</strong> {getStatusBadge(selectedReport.status)}</p>
              </div>
              
              {selectedReport.description && (
                <div className="detail-section">
                  <h4>신고 내용</h4>
                  <p>{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.status === 'RESOLVED' && (
                <div className="detail-section">
                  <h4>처리 정보</h4>
                  <p><strong>제재 유형:</strong> {selectedReport.penaltyType || '없음'}</p>
                  <p><strong>제재 내용:</strong> {selectedReport.penalty || '없음'}</p>
                  <p><strong>관리자 메모:</strong> {selectedReport.adminNote || '없음'}</p>
                </div>
              )}

              {selectedReport.status === 'PENDING' && (
                <div className="detail-section">
                  <h4>신고 처리</h4>
                  <div className="resolve-form">
                    <div className="form-group">
                      <label>제재 유형:</label>
                      <select id="penaltyType" className="form-input">
                        <option value="">선택하세요</option>
                        <option value="경고">경고</option>
                        <option value="채팅 제한">채팅 제한</option>
                        <option value="게시글 제한">게시글 제한</option>
                        <option value="계정 정지">계정 정지</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>제재 내용:</label>
                      <input type="text" id="penalty" className="form-input" placeholder="예: 채팅 제한 7일" />
                    </div>
                    <div className="form-group">
                      <label>관리자 메모:</label>
                      <textarea id="adminNote" className="form-input" placeholder="처리 사유를 입력하세요"></textarea>
                    </div>
                    <button
                      onClick={() => {
                        const penaltyType = document.getElementById('penaltyType').value;
                        const penalty = document.getElementById('penalty').value;
                        const adminNote = document.getElementById('adminNote').value;
                        handleResolve(selectedReport.id, penaltyType, penalty, adminNote);
                        handleCloseDetail();
                      }}
                      className="action-btn resolve-btn"
                    >
                      신고 처리
                    </button>
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