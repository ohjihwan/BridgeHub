import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 예: 토큰 삭제
    localStorage.removeItem('authToken');
    // 로그아웃 후 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>BridgeHub</h2>
      <div className="menu">
        <ul>
          <li>
            <NavLink to="/" end activeClassName="active">
              대시보드
            </NavLink>
          </li>
          <li>
            <NavLink to="/members" activeClassName="active">
              회원정보관리
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" activeClassName="active">
              신고관리
            </NavLink>
          </li>
          <li>
            <NavLink to="/statistics" activeClassName="active">
              통계
            </NavLink>
          </li>
        </ul>
        <ul className="bottom-menu">
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'inherit',
                font: 'inherit'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
