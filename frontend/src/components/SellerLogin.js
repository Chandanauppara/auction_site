import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerLogin } from '../api';
import './Auth.css';

function SellerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await sellerLogin(formData);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.token && data.seller) {
        localStorage.setItem('sellerToken', data.token);
        localStorage.setItem('sellerData', JSON.stringify({
          id: data.seller.id,
          name: data.seller.name,
          email: data.seller.email
        }));
        navigate('/seller-dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Seller!</h2>
        <p className="welcome-message">Please login to manage your auctions and items</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login as Seller'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have a seller account? <Link to="/seller-register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default SellerLogin; 