import React from 'react';

const Header = () => {
  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '#/login';
  };

  return (
    <div className="header">
      <h2>관리자 페이지</h2>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
};

export default Header;