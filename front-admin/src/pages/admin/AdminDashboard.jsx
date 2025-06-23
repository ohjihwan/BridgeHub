import React from 'react';
import '../../assets/scss/AdminDashboard.scss';
import logo from '../../assets/imgs/ico/logo.svg';

export default function AdminDashboard() {
  return (
    <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
      <img src={logo} alt="로고" style={{width: 180, marginBottom: 32}} />
      <h1>BridgeHub 관리자 대시보드</h1>
      <p>좌측 메뉴에서 원하는 기능을 선택하세요.</p>
    </div>
  );
}
