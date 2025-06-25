import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import SellerLogin from './components/SellerLogin';
import SellerRegister from './components/SellerRegister';
import AdminLogin from './components/AdminLogin';
import UserHome from './components/UserHome';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuctionProvider } from './context/AuctionContext';
import './App.css';

function App() {
  return (
    <AuctionProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seller-login" element={<SellerLogin />} />
              <Route path="/seller-register" element={<SellerRegister />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/dashboard" element={<UserHome />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuctionProvider>
  );
}

export default App; 