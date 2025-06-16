import React, { useState } from 'react';

const dummyMembers = [
  { id: 1, name: '이민우', email: 'example@example.com', status: '활성' },
  { id: 2, name: '오지환', email: 'exam@example.com', status: '정지' },
  { id: 3, name: '노현지', email: 'ex@example.com', status: '활성' },
];

function MemberManage() {
  const [search, setSearch] = useState('');

  const filteredMembers = dummyMembers.filter(member =>
    member.name.includes(search) || member.email.includes(search)
  );

  return (
    <div>
      <h2>회원정보관리</h2>
      <input
        type="text"
        placeholder="검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <table border="1" width="100%" cellPadding="5">
        <thead>
          <tr>
            <th>회원ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map(member => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MemberManage;
