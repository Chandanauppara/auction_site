import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerRegister } from '../api';
import './SellerRegister.css';

function SellerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const data = await sellerRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if we have all required data
      if (!data.seller || !data.seller.id || !data.seller.name || !data.seller.email || !data.token) {
        console.error('Invalid server response:', data);
        throw new Error('Invalid response from server');
      }

      // Store seller data in localStorage
      localStorage.setItem('sellerData', JSON.stringify({
        id: data.seller.id,
        name: data.seller.name,
        email: data.seller.email
      }));

      // Store token
      localStorage.setItem('sellerToken', data.token);
      
      // Redirect to seller dashboard
      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seller-register">
      <div className="register-container">
        <h2>Welcome to Seller Registration</h2>
        <p>Join our platform to start selling your items through auctions</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register as Seller'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/seller-login">Login as Seller</Link>
        </div>
      </div>
    </div>
  );
}

export default SellerRegister; 