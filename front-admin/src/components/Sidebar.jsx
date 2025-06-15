import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => (
  <div className="sidebar">
    <h2>BridgeHub</h2>
    <ul>
      <li><NavLink to="/">대시보드</NavLink></li>
      <li><NavLink to="/members">회원정보관리</NavLink></li>
      <li><NavLink to="/reports">신고관리</NavLink></li>
      <li><NavLink to="/statistics">통계</NavLink></li>
    </ul>
  </div>
);

export default Sidebar;