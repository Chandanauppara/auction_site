import React, { useState, useEffect } from 'react';
import { useAuctions } from '../context/AuctionContext';
import './UserHome.css';
import NotificationBell from './NotificationBell';

function UserHome() {
  const { activeAuctions, pastAuctions, cancelledAuctions, addBid } = useAuctions();
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  const handleBidClick = (item) => {
    setSelectedItem(item);
    setBidAmount('');
    setError('');
    setShowBidModal(true);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (amount <= selectedItem.currentBid) {
      setError(`Bid must be higher than current bid of ${formatPrice(selectedItem.currentBid)}`);
      return;
    }

    // Add the bid using the context function
    await addBid(selectedItem.id, {
      userId: 'current-user', // Replace with actual user ID
      userName: 'Current User', // Replace with actual user name
      amount: amount,
      timestamp: new Date().toISOString()
    });

    setShowBidModal(false);
    alert('Bid placed successfully!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-home">
      <header className="user-header">
        <h1>Auctions</h1>
        <div className="header-actions">
          <NotificationBell />
        </div>
      </header>

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
                  className="bid-button"
                  onClick={() => handleBidClick(auction)}
                >
                  Place Bid
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
                    <p className="current-bid">Last Bid: {formatPrice(auction.finalBid)}</p>
                    <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                  </div>
                  <div className="status-info">
                    <p className="status cancelled">Status: Cancelled</p>
                    <p className="cancelled-reason">Winner: {auction.winner}</p>
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
            <div key={`${auction.id}-${index}`} className="auction-card past">
              <div className="auction-content">
                <h3>{auction.title}</h3>
                <p className="description">{auction.description}</p>
                <div className="auction-details">
                  <div className="price-info">
                    <p className="current-bid">Final Price: {formatPrice(auction.finalBid)}</p>
                    <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                  </div>
                  <div className="winner-info">
                    <h4>Winner</h4>
                    <p className="winner-name">{auction.winner}</p>
                    <p className="winner-amount">{formatPrice(auction.finalBid)}</p>
                  </div>
                </div>
                <div className="bid-history">
                  <h4>Bid History</h4>
                  {(auction.bids || []).map((bid, index) => (
                    <div key={index} className="bid-item">
                      <span className="bidder">{bid.userName}</span>
                      <span className="bid-amount">{formatPrice(bid.amount)}</span>
                      <span className="bid-time">{formatDate(bid.timestamp)}</span>
                    </div>
                  ))}
                </div>
                <p className="end-time">Ended: {formatDate(auction.endTime)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showBidModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedItem.title}</h2>
            <p className="description">{selectedItem.description}</p>
            <div className="auction-details">
              <div className="price-info">
                <p className="current-bid">Current Bid: {formatPrice(selectedItem.currentBid)}</p>
                <p className="base-price">Base Price: {formatPrice(selectedItem.basePrice)}</p>
              </div>
              <p className="end-time">Ends: {formatDate(selectedItem.endTime)}</p>
            </div>
            <div className="bid-history">
              <h4>Bid History</h4>
              {(selectedItem.bids || []).map((bid, index) => (
                <div key={index} className="bid-item">
                  <span className="bidder">{bid.userName}</span>
                  <span className="bid-amount">{formatPrice(bid.amount)}</span>
                  <span className="bid-time">{formatDate(bid.timestamp)}</span>
                </div>
              ))}
            </div>
            <div className="bid-form">
              <label>Your Bid (₹):</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={selectedItem.currentBid + 100}
                step="100"
              />
              {error && <p className="error">{error}</p>}
              <div className="modal-buttons">
                <button onClick={handleBidSubmit}>Place Bid</button>
                <button onClick={() => setShowBidModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserHome; 