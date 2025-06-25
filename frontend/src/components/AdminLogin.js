import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for hardcoded admin credentials
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
      // Store admin authentication in localStorage
      localStorage.setItem('adminAuth', 'true');
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Admin Login</h2>
        <p className="welcome-message">Access the admin dashboard</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="Enter admin email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="form-input"
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="auth-button">Login as Admin</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin; 