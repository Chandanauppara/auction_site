const API_BASE_URL = 'http://localhost:8080/api';

// Common headers for all requests
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : '',
  'Accept': 'application/json'
});

// Auth APIs
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const sellerLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sellers/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login error details:', error);
    if (error.name === 'TypeError') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

export const sellerRegister = async (sellerData) => {
  try {
    console.log('Sending registration request:', sellerData);
    const response = await fetch(`${API_BASE_URL}/sellers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sellerData),
      mode: 'cors'
    });

    const data = await response.json();
    console.log('Server response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Validate response data
    if (!data.seller || !data.seller.id || !data.seller.name || !data.seller.email || !data.token) {
      console.error('Invalid server response:', data);
      throw new Error('Invalid response from server');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error details:', error);
    if (error.name === 'TypeError') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

export const adminLogin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Auction APIs
export const createAuction = async (auctionData, token) => {
  const response = await fetch(`${API_BASE_URL}/auctions`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(auctionData)
  });
  return response.json();
};

export const getActiveAuctions = async () => {
  const response = await fetch(`${API_BASE_URL}/auctions/active`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const getPastAuctions = async () => {
  const response = await fetch(`${API_BASE_URL}/auctions/past`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const getAuctionById = async (auctionId) => {
  const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const placeBid = async (auctionId, bidData, token) => {
  const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bid`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(bidData)
  });
  return response.json();
};

export const cancelAuction = async (auctionId, token) => {
  const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/cancel`, {
    method: 'POST',
    headers: getHeaders(token)
  });
  return response.json();
};

// User APIs
export const getUserProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

export const getUserBids = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/bids`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

// Seller APIs
export const getSellerProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

export const getSellerAuctions = async (sellerId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/auctions`, {
      method: 'GET',
      headers: getHeaders(token)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch seller auctions');
    }

    return data;
  } catch (error) {
    console.error('Error fetching seller auctions:', error);
    throw error;
  }
};

// Admin APIs
export const getAllAuctions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/auctions`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

export const getAllUsers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

export const getAllSellers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/sellers`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

// Notification APIs
export const getNotifications = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: getHeaders(token)
  });
  return response.json();
};

export const markNotificationAsRead = async (notificationId, token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getHeaders(token)
  });
  return response.json();
};

export const clearNotifications = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/clear`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  return response.json();
}; 