import React, { useState } from 'react';
import '../../assets/scss/MemberManage.scss';

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

function MemberManage() {
  const [search, setSearch] = useState('');

  const filteredMembers = dummyMembers.filter(member =>
    member.name.includes(search) || member.email.includes(search)
  );

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
      <div className="member-table-container">
        <table className="member-table">
          <thead>
            <tr>
              <th>회원ID</th>
              <th>이메일</th>
              <th>이름</th>
              <th>닉네임</th>
              <th>지역</th>
              <th>학력</th>
              <th>전공</th>
              <th>선호 시간대</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>#{member.id}</td>
                <td>{member.email}</td>
                <td>{member.name}</td>
                <td>{member.nickname}</td>
                <td>{member.region}</td>
                <td>{member.education}</td>
                <td>{member.major}</td>
                <td>{member.timezone}</td>
                <td>{member.signupDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div className="no-data">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default MemberManage;
