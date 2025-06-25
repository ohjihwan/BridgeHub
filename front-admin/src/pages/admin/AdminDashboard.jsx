import React from 'react';
import '../../assets/scss/AdminDashboard.scss';
import logo from '../../assets/imgs/ico/logoc.svg';

export default function AdminDashboard() {
  return (
    <div className="dashboard-admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh'}}>
      <img src={logo} alt="로고" style={{width: 300, marginBottom: -64, opacity: 0.5}} />
    </div>
  );
}
