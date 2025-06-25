import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/items">Auction System</Link>
        <div className="navbar-nav ms-auto">
          {!token && <Link className="nav-link" to="/login">Login</Link>}
          {!token && <Link className="nav-link" to="/register">Register</Link>}
          {token && <Link className="nav-link" to="/create">Create Item</Link>}
          {token && <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 