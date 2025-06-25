import React, { useState, useEffect } from 'react';
import { useAuctions } from '../context/AuctionContext';
import './UserDashboard.css';
import NotificationBell from './NotificationBell';

function UserDashboard() {
  const { activeAuctions, pastAuctions, cancelledAuctions } = useAuctions();
  const [userData, setUserData] = useState(null);
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    setLoading(false);
  }, []);

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

  const getTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <h1>Welcome, {userData?.name || 'User'}</h1>
        <NotificationBell />
      </header>

      <div className="dashboard-content">
        <section className="your-bids">
          <h2>Your Active Bids</h2>
          <div className="auctions-grid">
            {activeAuctions.filter(auction => 
              auction.bids.some(bid => bid.userId === userData?.id)
            ).map(auction => (
              <div key={auction.id} className="auction-card">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Current Bid: {formatPrice(auction.currentBid)}</p>
                      <p className="your-bid">
                        Your Highest Bid: {formatPrice(
                          Math.max(...auction.bids
                            .filter(bid => bid.userId === userData?.id)
                            .map(bid => bid.amount)
                          )
                        )}
                      </p>
                    </div>
                    <p className="time-left">{getTimeLeft(auction.endTime)}</p>
                    <p className="seller">Seller: {auction.sellerName}</p>
                  </div>
                  <div className="bid-history">
                    <h4>Recent Bids</h4>
                    {auction.bids.slice(0, 3).map((bid, index) => (
                      <div key={index} className="bid-item">
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

        <section className="available-auctions">
          <h2>Available Auctions</h2>
          <div className="auctions-grid">
            {activeAuctions.filter(auction => 
              !auction.bids.some(bid => bid.userId === userData?.id)
            ).map(auction => (
              <div key={auction.id} className="auction-card">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="current-bid">Current Bid: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <p className="time-left">{getTimeLeft(auction.endTime)}</p>
                    <p className="seller">Seller: {auction.sellerName}</p>
                  </div>
                  <div className="bid-history">
                    <h4>Recent Bids</h4>
                    {auction.bids.slice(0, 3).map((bid, index) => (
                      <div key={index} className="bid-item">
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

        <section className="cancelled-auctions">
          <h2>Cancelled Auctions</h2>
          <div className="auctions-grid">
            {cancelledAuctions.map(auction => (
              <div key={auction.id} className="auction-card cancelled">
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
            {pastAuctions.map(auction => (
              <div key={auction.id} className="auction-card past">
                <div className="auction-content">
                  <h3>{auction.title}</h3>
                  <p className="description">{auction.description}</p>
                  <div className="auction-details">
                    <div className="price-info">
                      <p className="final-price">Final Price: {formatPrice(auction.currentBid)}</p>
                      <p className="base-price">Base Price: {formatPrice(auction.basePrice)}</p>
                    </div>
                    <div className="status-info">
                      <p className="winner">
                        Winner: {auction.bids[auction.bids.length - 1]?.userName || 'No winner'}
                      </p>
                      <p className="seller">Seller: {auction.sellerName}</p>
                    </div>
                    <p className="end-time">Ended: {formatDate(auction.endTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboard; 