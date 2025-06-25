import React, { useState, useEffect } from 'react';
import { useAuctions } from '../context/AuctionContext';
import './SellerDashboard.css';
import NotificationBell from './NotificationBell';
import { createAuction, getSellerAuctions } from '../api';

function SellerDashboard() {
  const { activeAuctions, pastAuctions, cancelledAuctions, setActiveAuctions, setPastAuctions, setCancelledAuctions } = useAuctions();
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    basePrice: '',
    duration: '7', // Default to 7 days
    sellerId: '',
    sellerName: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    basePrice: '',
    duration: '',
    sellerId: '',
    sellerName: ''
  });

  // Load seller data on component mount
  useEffect(() => {
    const storedSellerData = localStorage.getItem('sellerData');
    if (storedSellerData) {
      const seller = JSON.parse(storedSellerData);
      setSellerData(seller);
      setItemData(prev => ({
        ...prev,
        sellerId: seller.id.toString(),
        sellerName: seller.name
      }));
    }
  }, []);

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (showNewItemModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showNewItemModal]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim() === '' ? 'Title is required' : '';
      case 'description':
        return value.trim() === '' ? 'Description is required' : 
               value.trim().length < 10 ? 'Description must be at least 10 characters' : '';
      case 'basePrice':
        return value.trim() === '' ? 'Base price is required' : 
               isNaN(value) || Number(value) <= 0 ? 'Base price must be a positive number' : '';
      case 'duration':
        return value.trim() === '' ? 'Duration is required' : 
               isNaN(value) || Number(value) < 1 ? 'Duration must be at least 1 day' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: value
    });
    setFieldErrors({
      ...fieldErrors,
      [name]: validateField(name, value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields
    const errors = {
      title: validateField('title', itemData.title),
      description: validateField('description', itemData.description),
      basePrice: validateField('basePrice', itemData.basePrice),
      duration: validateField('duration', itemData.duration)
    };

    setFieldErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      setError('Please fill in all required fields correctly');
      return;
    }

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + parseInt(itemData.duration));

    // Prepare auction data for backend
    const auctionData = {
      name: itemData.title.trim(),
      description: itemData.description.trim(),
      starting_price: Number(itemData.basePrice),
      end_time: endTime.toISOString()
    };

    try {
      const token = localStorage.getItem('sellerToken');
      const response = await createAuction(auctionData, token);
      console.log('Create auction response:', response);
      if (response && response.message && response.message.toLowerCase().includes('item created')) {
        // Refetch seller auctions from backend
        const updatedAuctions = await getSellerAuctions(sellerData.id, token);
        if (Array.isArray(updatedAuctions)) {
          setActiveAuctions(updatedAuctions.filter(a => a.status === 'active'));
          setPastAuctions(updatedAuctions.filter(a => a.status === 'ended'));
          setCancelledAuctions(updatedAuctions.filter(a => a.status === 'cancelled'));
        }
        setShowNewItemModal(false);
        resetForm();
      } else {
        setError('Failed to create auction.');
      }
    } catch (err) {
      setError('Failed to create auction.');
    }
  };

  const resetForm = () => {
    setItemData({
      ...itemData,
      title: '',
      description: '',
      basePrice: '',
      duration: '7'
    });
    setFieldErrors({
      title: '',
      description: '',
      basePrice: '',
      duration: ''
    });
    setError('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter auctions for the current seller
  const sellerActiveAuctions = activeAuctions.filter(auction => auction.sellerName === sellerData?.name);
  const sellerPastAuctions = pastAuctions.filter(auction => auction.sellerName === sellerData?.name);
  const sellerCancelledAuctions = cancelledAuctions.filter(auction => auction.sellerName === sellerData?.name);

  return (
    <div className="seller-dashboard">
      <header className="seller-header">
        <h1>Seller Dashboard</h1>
        <div className="header-actions">
          <button 
            className="new-item-button"
            onClick={() => setShowNewItemModal(true)}
          >
            Add New Item
          </button>
          <NotificationBell />
        </div>
      </header>

      <div className="dashboard-content">
        <section className="active-auctions">
          <h2>Your Active Auctions</h2>
          <div className="auctions-grid">
            {sellerActiveAuctions.map((auction, idx) => (
              <div key={`${auction.id}-${idx}`} className="auction-card">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Current Bid: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <p className="end-time">Ends: {formatDate(auction.endTime)}</p>
                  </div>
                  <div className="bid-history">
                    <h4>Recent Bids</h4>
                    {(auction.bids || []).slice(0, 3).map((bid, index) => (
                      <div key={`${auction.id}-${index}`} className="bid-item">
                        <span className="bidder">{bid.userName}</span>
                        <span className="bid-amount">{formatPrice(bid.amount)}</span>
                        <span className="bid-time">{formatDate(bid.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="past-auctions">
          <h2>Your Past Auctions</h2>
          <div className="auctions-grid">
            {sellerPastAuctions.map((auction, idx) => (
              <div key={`${auction.id}-${idx}`} className="auction-card past">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Final Price: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <div className="status-info">
                      <p className={`status ${auction.status}`}>
                        Status: {auction.status ? auction.status.charAt(0).toUpperCase() + auction.status.slice(1) : 'Unknown'}
                      </p>
                      {auction.winner && <p>Winner: {auction.winner}</p>}
                    </div>
                    <p className="end-time">Ended: {formatDate(auction.endTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cancelled-auctions">
          <h2>Your Cancelled Auctions</h2>
          <div className="auctions-grid">
            {sellerCancelledAuctions.map((auction, idx) => (
              <div key={`${auction.id}-${idx}`} className="auction-card cancelled">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Last Bid: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <div className="status-info">
                      <p className="status cancelled">Status: Cancelled</p>
                    </div>
                    <p className="end-time">Cancelled: {formatDate(auction.endTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showNewItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Item for Auction</h2>
            <form onSubmit={handleSubmit} className="create-item-form">
              <div className="form-group">
                <label>Title: <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleInputChange}
                  className={fieldErrors.title ? 'error' : ''}
                />
                {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
              </div>

              <div className="form-group">
                <label>Description: <span className="required">*</span></label>
                <textarea
                  name="description"
                  value={itemData.description}
                  onChange={handleInputChange}
                  className={fieldErrors.description ? 'error' : ''}
                />
                {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
              </div>

              <div className="form-group">
                <label>Base Price (₹): <span className="required">*</span></label>
                <input
                  type="number"
                  name="basePrice"
                  value={itemData.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  className={fieldErrors.basePrice ? 'error' : ''}
                />
                {fieldErrors.basePrice && <p className="field-error">{fieldErrors.basePrice}</p>}
              </div>

              <div className="form-group">
                <label>Duration (days): <span className="required">*</span></label>
                <input
                  type="number"
                  name="duration"
                  value={itemData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={fieldErrors.duration ? 'error' : ''}
                />
                {fieldErrors.duration && <p className="field-error">{fieldErrors.duration}</p>}
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Create Auction
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowNewItemModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard; 