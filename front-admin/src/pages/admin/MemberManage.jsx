import React, { useState } from 'react';
import '../../assets/scss/MemberManage.scss';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const dummyMembers = [
  {
    id: 1,
    email: 'example@example.com',
    name: '이민우',
    nickname: '민우',
    region: '서울특별시',
    education: '고졸',
    major: '컴퓨터공학',
    timezone: '12:00-18:00',
    signupDate: '2024-02-10'
  },
  {
    id: 2,
    email: 'exam@example.com',
    name: '오지환',
    nickname: '지환',
    region: '부산광역시',
    education: '대학교',
    major: '금융공학',
    timezone: '18:00-24:00',
    signupDate: '2024-06-05'
  },
  {
    id: 3,
    email: 'ex@example.com',
    name: '노현지',
    nickname: '현지',
    region: '대구광역시',
    education: '대학원',
    major: '통계학',
    timezone: '06:00-12:00',
    signupDate: '2025-01-20'
  }
];

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
  const [rows, setRows] = useState(dummyMembers);

  const filteredRows = rows.filter(member =>
    member.name.includes(search) || member.email.includes(search)
  );

  const handleDelete = (id) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

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
          pageSize={5}
          rowsPerPageOptions={[5]}
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
