import React, { useState } from 'react';
import { useAuctions } from '../context/AuctionContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { activeAuctions, pastAuctions, cancelledAuctions, addNewAuction, moveToCancelledAuctions } = useAuctions();
  const [showNewAuctionModal, setShowNewAuctionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [auctionData, setAuctionData] = useState({
    title: '',
    description: '',
    duration: '7'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    duration: ''
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim() === '' ? 'Auction title is required' : '';
      case 'description':
        return value.trim() === '' ? 'Description is required' : 
               value.trim().length < 10 ? 'Description must be at least 10 characters' : '';
      case 'duration':
        return value.trim() === '' ? 'Duration is required' : 
               isNaN(value) ? 'Duration must be a number' : 
               value < 1 ? 'Duration must be at least 1 day' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuctionData({
      ...auctionData,
      [name]: value
    });
    setFieldErrors({
      ...fieldErrors,
      [name]: validateField(name, value)
    });
  };

  const handleCreateAuction = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {
      title: validateField('title', auctionData.title),
      description: validateField('description', auctionData.description),
      duration: validateField('duration', auctionData.duration)
    };

    setFieldErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      setError('Please fill in all required fields correctly');
      return;
    }

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + parseInt(auctionData.duration));

    const newAuction = {
      id: Date.now(),
      title: auctionData.title.trim(),
      description: auctionData.description.trim(),
      basePrice: 0,
      currentBid: 0,
      bids: [],
      endTime: endTime.toISOString(),
      sellerId: 'admin',
      sellerName: 'Admin',
      status: 'active',
      isNew: true
    };

    addNewAuction(newAuction);
    setShowNewAuctionModal(false);
    resetForm();
  };

  const handleCancelAuction = (auction) => {
    setSelectedAuction(auction);
    setShowCancelModal(true);
  };

  const confirmCancelAuction = () => {
    if (selectedAuction) {
      moveToCancelledAuctions(selectedAuction);
      setShowCancelModal(false);
      setSelectedAuction(null);
    }
  };

  const resetForm = () => {
    setAuctionData({
      title: '',
      description: '',
      duration: '7'
    });
    setFieldErrors({
      title: '',
      description: '',
      duration: ''
    });
    setError('');
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button 
          className="new-auction-button"
          onClick={() => setShowNewAuctionModal(true)}
        >
          Create New Auction
        </button>
      </header>

      <div className="dashboard-content">
        <section className="active-auctions">
          <h2>Active Auctions</h2>
          <div className="auctions-grid">
            {activeAuctions.map((auction, index) => (
              <div key={`${auction.id}-${index}`} className="auction-card">
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
                      <div key={index} className="bid-item">
                        <span className="bidder">{bid.userName}</span>
                        <span className="bid-amount">{formatPrice(bid.amount)}</span>
                        <span className="bid-time">{formatDate(bid.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="cancel-button"
                    onClick={() => handleCancelAuction(auction)}
                  >
                    Cancel Auction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cancelled-auctions">
          <h2>Cancelled Auctions</h2>
          <div className="auctions-grid">
            {cancelledAuctions.map((auction, index) => (
              <div key={`${auction.id}-${index}`} className="auction-card cancelled">
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
                      {auction.winner && <p className="cancelled-reason">Winner: {auction.winner}</p>}
                    </div>
                    <p className="end-time">Cancelled: {formatDate(auction.endTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="past-auctions">
          <h2>Past Auctions</h2>
          <div className="auctions-grid">
            {pastAuctions.map((auction, index) => (
              <div key={`${auction.id}-${index}`} className="auction-card">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Final Price: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <div className="seller-info">
                      <p>Seller: {auction.sellerName}</p>
                      <p>Seller ID: {auction.sellerId}</p>
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
      </div>

      {showNewAuctionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Auction</h2>
            <form onSubmit={handleCreateAuction} className="create-auction-form">
              <h3>Create New Auction</h3>
              
              <div className="form-group">
                <label>Title: <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={auctionData.title}
                  onChange={handleInputChange}
                  className={fieldErrors.title ? 'error' : ''}
                />
                {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
              </div>

              <div className="form-group">
                <label>Description: <span className="required">*</span></label>
                <textarea
                  name="description"
                  value={auctionData.description}
                  onChange={handleInputChange}
                  className={fieldErrors.description ? 'error' : ''}
                />
                {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
              </div>

              <div className="form-group">
                <label>Duration (days): <span className="required">*</span></label>
                <input
                  type="number"
                  name="duration"
                  value={auctionData.duration}
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
                    setShowNewAuctionModal(false);
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

      {showCancelModal && selectedAuction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cancel Auction</h2>
            <p>Are you sure you want to cancel this auction?</p>
            <div className="auction-summary">
              <h3>{selectedAuction.title}</h3>
              <p>Current Bid: {formatPrice(selectedAuction.currentBid)}</p>
              <p>Seller: {selectedAuction.sellerName}</p>
            </div>
            <div className="modal-buttons">
              <button 
                className="confirm-cancel-button"
                onClick={confirmCancelAuction}
              >
                Confirm Cancel
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAuction(null);
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 