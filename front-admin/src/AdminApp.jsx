import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberManage from './pages/admin/MemberManage';
import ReportManage from './pages/admin/ReportManage';
import Statistics from './pages/admin/Statistics';

function AdminApp() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/members" element={<MemberManage />} />
          <Route path="/reports" element={<ReportManage />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default AdminApp;
