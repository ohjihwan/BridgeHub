import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import './assets/scss/layout.scss';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
