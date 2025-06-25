import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const isAdminAuthenticated = localStorage.getItem('adminAuth') === 'true';

  if (!isAdminAuthenticated) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute; 