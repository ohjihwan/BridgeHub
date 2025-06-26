import React from 'react';
import '../../assets/scss/AdminDashboard.scss';
import logo from '../../assets/imgs/ico/logo.svg';

export default function AdminDashboard() {
  return (
    <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
      <img src={logo} alt="로고" style={{width: 180, marginBottom: 32}} />
    </div>
  );
}
