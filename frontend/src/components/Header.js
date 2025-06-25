import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <h1>Auction Site</h1>
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/login" className="nav-link">User Login</Link>
          <Link to="/seller-login" className="nav-link">Seller Login</Link>
          <Link to="/admin-login" className="nav-link">Admin Login</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header; 