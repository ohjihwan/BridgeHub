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
  const [isEditing, setIsEditing] = useState(false);
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
      const reportsData = content.map(report => {
        // 관리자 코멘트에서 지저분한 구조화된 내용 제거
        let cleanAdminNote = report.adminComment || '';
        
        // "제재항목: xxx, 제재내용: xxx, 관리자메모: xxx" 형태에서 관리자메모 부분만 추출
        if (cleanAdminNote.includes('관리자메모:')) {
          const parts = cleanAdminNote.split('관리자메모:');
          if (parts.length > 1) {
            cleanAdminNote = parts[1].trim();
            // "없음"이면 빈 문자열로 처리
            if (cleanAdminNote === '없음') {
              cleanAdminNote = '';
            }
          }
        }
        
        return {
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
          adminNote: cleanAdminNote
        };
      });
      
      setReports(reportsData);
      console.log('전체 신고 목록 업데이트 완료:', reportsData.length, '개');
      
      // 현재 선택된 신고가 있다면 업데이트된 데이터로 갱신
      if (selectedReport) {
        console.log('현재 선택된 신고 ID:', selectedReport.id);
        const updatedSelectedReport = reportsData.find(report => report.id === selectedReport.id);
        if (updatedSelectedReport) {
          console.log('선택된 신고 업데이트 전:', { 
            id: selectedReport.id, 
            status: selectedReport.status, 
            adminNote: selectedReport.adminNote 
          });
          console.log('선택된 신고 업데이트 후:', { 
            id: updatedSelectedReport.id, 
            status: updatedSelectedReport.status, 
            adminNote: updatedSelectedReport.adminNote 
          });
          setSelectedReport(updatedSelectedReport);
        } else {
          console.log('업데이트된 데이터에서 선택된 신고를 찾을 수 없음');
        }
      } else {
        console.log('현재 선택된 신고가 없음');
      }
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
    setIsEditing(false);
  };

  const handleResolve = async (reportId, penaltyType = '', penalty = '', adminNote = '', status = 'RESOLVED') => {
    try {
      console.log('handleResolve 시작 - 전송할 데이터:', { reportId, penaltyType, penalty, adminNote, status });
      
      const response = await resolveReport(reportId, {
        penaltyType,
        penalty,
        adminNote,
        status
      });
      
      console.log('백엔드 응답:', response);
      
      // 목록 새로고침
      console.log('목록 새로고침 시작');
      await loadReports();
      console.log('목록 새로고침 완료');
      
      alert('신고가 처리되었습니다.');
    } catch (err) {
      console.error('handleResolve 에러:', err);
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
  const ReportResolutionForm = ({ reportId, onResolve, onCancel, initialData = {}, isEdit = false }) => {
    const [penaltyType, setPenaltyType] = useState(initialData.penaltyType || '');
    const [penalty, setPenalty] = useState(initialData.penalty || '');
    const [adminNote, setAdminNote] = useState(initialData.adminNote || '');
    const [status, setStatus] = useState(initialData.status || 'RESOLVED');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // initialData가 변경될 때 상태 업데이트
    useEffect(() => {
      console.log('ReportResolutionForm useEffect 실행 - initialData:', initialData);
      console.log('상태 업데이트 전:', { penaltyType, penalty, adminNote, status });
      
      setPenaltyType(initialData.penaltyType || '');
      setPenalty(initialData.penalty || '');
      setAdminNote(initialData.adminNote || '');
      setStatus(initialData.status || 'RESOLVED');
      
      console.log('상태 업데이트 후:', { 
        penaltyType: initialData.penaltyType || '', 
        penalty: initialData.penalty || '', 
        adminNote: initialData.adminNote || '', 
        status: initialData.status || 'RESOLVED' 
      });
    }, [initialData.penaltyType, initialData.penalty, initialData.adminNote, initialData.status]);



    // 처리 유형별 처리 내용 옵션
    const penaltyOptions = {
      '경고': [
        '1차 경고',
        '2차 경고',
        '3차 경고',
        '최종 경고'
      ],
      '일시정지': [
        '1일 정지',
        '3일 정지',
        '7일 정지',
        '15일 정지',
        '30일 정지'
      ],
      '영구정지': [
        '영구 계정 정지',
        '영구 서비스 이용 제한'
      ],
      '무혐의': [
        '허위 신고',
        '증거 불충분',
        '규정 위반 없음'
      ],
      '기타': [
        '주의 조치',
        '콘텐츠 삭제',
        '기능 제한',
        '직접 입력'
      ]
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 새로 처리하는 경우에만 처리유형과 처리내용 검증
      if (!isEdit && (!penaltyType || !penalty)) {
        alert('처리 유형과 처리 내용을 선택해주세요.');
        return;
      }

      setIsSubmitting(true);
      try {
        // 수정 모드에서는 상태와 관리자 코멘트 전달, 새 처리에서는 처리유형과 처리내용도 전달
        if (isEdit) {
          console.log('수정 모드 - 전송 데이터:', { reportId, adminNote, status });
          await onResolve(reportId, '', '', adminNote, status);
        } else {
          console.log('새 처리 모드 - 전송 데이터:', { reportId, penaltyType, penalty, adminNote });
          await onResolve(reportId, penaltyType, penalty, adminNote);
        }
        onCancel(); // 폼 닫기
      } catch (error) {
        console.error('신고 처리 실패:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // 처리 유형 변경 시 처리 내용 초기화
    const handlePenaltyTypeChange = (e) => {
      setPenaltyType(e.target.value);
      setPenalty(''); // 처리 내용을 빈 값으로 초기화
    };

          return (
        <div className="resolution-form-container">
                  <div className="form-header">
          <h4>{isEdit ? '처리 상태 및 코멘트 수정' : '신고 처리'}</h4>
          <p className="form-description">
            {isEdit 
              ? '처리 상태를 변경하고 관리자 코멘트를 수정할 수 있습니다.' 
              : '신고 내용을 검토하고 적절한 처리 조치를 선택해주세요.'
            }
          </p>
        </div>
        
                <form onSubmit={handleSubmit} className="resolution-form">
          {!isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="penaltyType">
                  <span className="label-text">처리 유형</span>
                  <span className="required">*</span>
                </label>
                <select
                  id="penaltyType"
                  value={penaltyType}
                  onChange={handlePenaltyTypeChange}
                  className="form-select"
                  required
                >
                  <option value="">처리 유형을 선택하세요</option>
                  <option value="경고">⚠️ 경고</option>
                  <option value="일시정지">🔒 일시정지</option>
                  <option value="영구정지">🚫 영구정지</option>
                  <option value="무혐의">✅ 무혐의</option>
                  <option value="기타">⚙️ 기타</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="penalty">
                  <span className="label-text">처리 내용</span>
                  <span className="required">*</span>
                </label>
                <select
                  id="penalty"
                  key={penaltyType} // 처리유형이 변경될 때마다 컴포넌트 재생성
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  className="form-select"
                  required
                  disabled={!penaltyType}
                >
                  <option value="">처리 내용을 선택하세요</option>
                  {penaltyType && penaltyOptions[penaltyType] && 
                    penaltyOptions[penaltyType].map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))
                  }
                </select>
                {penalty === '직접 입력' && (
                  <input
                    type="text"
                    className="form-input custom-penalty-input"
                    placeholder="처리 내용을 직접 입력하세요"
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
                      )}
           
           {isEdit && (
             <div className="form-group" id="status-form-group">
               <label htmlFor="status">
                 <span className="label-text">처리 상태</span>
                 <span className="required">*</span>
               </label>
               <select
                 id="status"
                 value={status}
                 onChange={(e) => {
                   console.log('처리상태 변경:', e.target.value);
                   setStatus(e.target.value);
                 }}
                 className="form-select status-select"
                 required
               >
                 <option value="PENDING">⏳ 대기중</option>
                 <option value="PROCESSING">🔄 처리중</option>
                 <option value="RESOLVED">✅ 처리완료</option>
                 <option value="REJECTED">❌ 거절됨</option>
               </select>
             </div>
           )}
           
           <div className="form-group">
             <label htmlFor="adminNote">
               <span className="label-text">관리자 코멘트</span>
               <span className="optional">(선택사항)</span>
             </label>
             <textarea
               id="adminNote"
               value={adminNote}
               onChange={(e) => setAdminNote(e.target.value)}
               className="form-textarea"
               placeholder="관리자 코멘트를 자유롭게 작성하세요."
               rows="4"
             />
             <div className="textarea-help">
               <small>필요에 따라 처리 사유나 추가 설명을 작성할 수 있습니다.</small>
             </div>
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
                 {isSubmitting ? (
                   <>
                     <span className="spinner"></span>
                     {isEdit ? '수정 중...' : '처리 중...'}
                   </>
                 ) : (
                   isEdit ? '수정 완료' : '신고 처리'
                 )}
               </button>
          </div>
        </form>
      </div>
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

              {/* 처리 결과 카드 (모든 상태에서 수정 가능) */}
              {!isEditing && (
                <div className="info-card resolution-card">
                  <div className="card-header">
                    <h4>처리 상태 관리</h4>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="edit-button"
                      title="처리 상태 및 코멘트 수정"
                    >
                      ✏️ 수정
                    </button>
                  </div>
                  <div className="card-content">
                    <div className="resolution-grid">
                      <div className="resolution-item">
                        <div className="info-label">현재 처리 상태</div>
                        <div className="info-value">
                          {getStatusBadge(selectedReport.status)}
                        </div>
                      </div>
                      <div className="resolution-item">
                        <div className="info-label">처리 일시</div>
                        <div className="info-value">{selectedReport.date}</div>
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

              {/* 처리 상태 수정 폼 (모든 상태에서 수정 가능) */}
              {isEditing && (
                <div className="info-card action-card">
                  <div className="card-header">
                    <h4>처리 상태 및 코멘트 수정</h4>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="cancel-edit-button"
                      title="수정 취소"
                    >
                      ❌ 취소
                    </button>
                  </div>
                  <div className="card-content">
                    <ReportResolutionForm 
                      key={`edit-${selectedReport.id}-${selectedReport.status}-${selectedReport.adminNote}`}
                      reportId={selectedReport.id}
                      initialData={{
                        adminNote: selectedReport.adminNote,
                        status: selectedReport.status
                      }}
                      onResolve={(reportId, penaltyType, penalty, adminNote, status) => {
                        handleResolve(reportId, penaltyType, penalty, adminNote, status);
                        setIsEditing(false);
                      }}
                      onCancel={() => setIsEditing(false)}
                      isEdit={true}
                    />
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
                      key={`new-${selectedReport.id}`}
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