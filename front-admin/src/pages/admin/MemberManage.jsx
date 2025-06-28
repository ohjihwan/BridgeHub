import React, { useState, useEffect } from 'react';
import '../../assets/scss/MemberManage.scss';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchUsers, updateUserRole } from '../../services/api';

// DataGrid 한글 메시지 직접 지정
const localeText = {
  noRowsLabel: '표시할 데이터가 없습니다',
  noResultsOverlayLabel: '검색 결과가 없습니다',
  toolbarDensity: '밀도',
  toolbarDensityLabel: '밀도',
  toolbarDensityCompact: '좁게',
  toolbarDensityStandard: '보통',
  toolbarDensityComfortable: '넓게',
  // 필요시 추가
};

function MemberManage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const loadMembers = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await fetchUsers({ page, size });
      const data = response.data.data;
      setRows(data.content || []);
      setTotalRows(data.totalElements || 0);
    } catch (err) {
      console.error('회원 데이터 로드 실패:', err);
      setError('회원 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel]);

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        // 실제로는 회원 상태를 DELETED로 변경
        await updateUserRole(id, 'DELETED');
        // 목록 새로고침
        loadMembers(paginationModel.page, paginationModel.pageSize);
        alert('회원이 삭제되었습니다.');
      } catch (err) {
        console.error('회원 삭제 실패:', err);
        alert('회원 삭제에 실패했습니다.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserRole(id, newStatus);
      // 목록 새로고침
      loadMembers(paginationModel.page, paginationModel.pageSize);
      alert('회원 상태가 변경되었습니다.');
    } catch (err) {
      console.error('회원 상태 변경 실패:', err);
      alert('회원 상태 변경에 실패했습니다.');
    }
  };

  const filteredRows = rows.filter(member =>
    member.name?.includes(search) || member.email?.includes(search)
  );

  // minWidth 없이 flex만 남겨서, 화면이 줄어들 때 flex 비율대로 계속 줄어듦
  const columns = [
    { field: 'id', headerName: '회원ID', flex: 0.7, minWidth: 50, renderCell: (params) => `#${params.value}` },
    {
      field: 'email',
      headerName: '이메일',
      flex: 2,
      minWidth: 100,
      renderCell: (params) => (
        <span
          title={params.value}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', width: '100%' }}
        >
          {params.value}
        </span>
      ),
    },
    { field: 'name', headerName: '이름', flex: 1, minWidth: 60 },
    { field: 'nickname', headerName: '닉네임', flex: 1, minWidth: 60 },
    { field: 'region', headerName: '지역', flex: 1, minWidth: 60 },
    { field: 'education', headerName: '학력', flex: 1, minWidth: 60 },
    { field: 'major', headerName: '전공', flex: 1, minWidth: 60 },
    { field: 'timezone', headerName: '선호 시간대', flex: 1, minWidth: 80 },
    { field: 'signupDate', headerName: '가입일', flex: 1, minWidth: 80 },
    {
      field: 'status',
      headerName: '상태',
      flex: 1,
      minWidth: 80,
      renderCell: (params) => (
        <select
          value={params.value || 'ACTIVE'}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          style={{ padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="ACTIVE">활성</option>
          <option value="BANNED">차단</option>
          <option value="SUSPENDED">정지</option>
          <option value="DELETED">삭제</option>
        </select>
      ),
    },
    {
      field: 'action',
      headerName: '관리',
      flex: 0.7,
      minWidth: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (error) {
    return (
      <div className="member-manage">
        <div className="member-header">
          <h2>회원정보관리</h2>
        </div>
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="member-manage">
      <div className="member-header">
        <h2>회원정보관리</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="이름, 이메일로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>  
      {/* DataGrid가 항상 가로 100%를 채우고, flex 컬럼으로 빈 공간 없이 반응형 */}
      <div
        className="member-table-container"
        style={{
          width: '100%',
          minWidth: 800,
          background: '#fff',
          overflowX: 'auto',
          padding: 0,
          margin: 0,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          rowCount={totalRows}
          paginationMode="server"
          loading={loading}
          disableSelectionOnClick
          autoHeight
          localeText={localeText}
          sx={{
            minWidth: 800,
            width: '100%',
            maxWidth: '100%',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-virtualScroller': {
              minWidth: 800,
              width: '100%',
              maxWidth: '100%',
            },
          }}
        />
      </div>
    </div>
  );
}

export default MemberManage;