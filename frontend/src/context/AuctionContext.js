import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getActiveAuctions, 
  getPastAuctions, 
  getNotifications,
  markNotificationAsRead,
  clearNotifications as clearNotificationsApi,
  getSellerAuctions,
  cancelAuction,
  placeBid
} from '../api';

const AuctionContext = createContext();

// Initial dummy data
const initialActiveAuctions = [
  {
    id: 1,
    title: 'Vintage Watch',
    description: 'A beautiful vintage watch from the 1950s',
    currentBid: 7500,
    basePrice: 5000,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    sellerId: 'seller1',
    sellerName: 'John Smith',
    bids: [
      { id: 1, userId: 'user1', userName: 'John Doe', amount: 7500, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 2, userId: 'user2', userName: 'Jane Smith', amount: 6000, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: 3, userId: 'user3', userName: 'Mike Johnson', amount: 5500, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 2,
    title: 'Antique Vase',
    description: 'Chinese porcelain vase from the Ming dynasty',
    currentBid: 15000,
    basePrice: 10000,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sellerId: 'seller2',
    sellerName: 'Sarah Wilson',
    bids: [
      { id: 4, userId: 'user4', userName: 'Sarah Wilson', amount: 15000, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { id: 5, userId: 'user5', userName: 'Tom Brown', amount: 12000, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

const initialPastAuctions = [
  {
    id: 3,
    title: 'Classic Car',
    description: 'Restored 1965 Mustang',
    currentBid: 2500000,
    basePrice: 2000000,
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sellerId: 'seller3',
    sellerName: 'Mike Johnson',
    bids: [
      { id: 6, userId: 'user3', userName: 'Mike Johnson', amount: 2500000, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    winner: 'Mike Johnson',
    status: 'completed'
  }
];

// Initial cancelled auctions data
const initialCancelledAuctions = [
  {
    id: 4,
    title: 'Rare Coin Collection',
    description: 'Collection of ancient Roman coins',
    currentBid: 50000,
    basePrice: 45000,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sellerId: 'seller4',
    sellerName: 'David Brown',
    bids: [
      { id: 7, userId: 'user6', userName: 'Alice White', amount: 50000, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, userId: 'user7', userName: 'Bob Green', amount: 47000, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    status: 'cancelled',
    winner: 'Auction Cancelled'
  },
  {
    id: 5,
    title: 'Vintage Camera',
    description: 'Leica M3 from 1954',
    currentBid: 35000,
    basePrice: 30000,
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sellerId: 'seller5',
    sellerName: 'Emma Davis',
    bids: [
      { id: 9, userId: 'user8', userName: 'Charlie Brown', amount: 35000, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    status: 'cancelled',
    winner: 'Auction Cancelled'
  }
];

export const AuctionProvider = ({ children }) => {
  const [activeAuctions, setActiveAuctions] = useState(initialActiveAuctions);
  const [pastAuctions, setPastAuctions] = useState(initialPastAuctions);
  const [cancelledAuctions, setCancelledAuctions] = useState(initialCancelledAuctions);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const sellerData = JSON.parse(localStorage.getItem('sellerData'));
        
        if (token && sellerData) {
          // Only fetch from API if we have authentication
          let auctions = null;
          try {
            auctions = await getSellerAuctions(sellerData.id, token);
          } catch (err) {
            auctions = null;
          }
          if (Array.isArray(auctions)) {
            // Split auctions by status
            const active = auctions.filter(a => a.status === 'active') || [];
            const past = auctions.filter(a => a.status === 'ended') || [];
            const cancelled = auctions.filter(a => a.status === 'cancelled') || [];
            setActiveAuctions(active);
            setPastAuctions(past);
            setCancelledAuctions(cancelled);
          } else {
            // Fallback: set all to empty arrays
            setActiveAuctions([]);
            setPastAuctions([]);
            setCancelledAuctions([]);
            console.error('Received invalid auctions data:', auctions);
            setError('Invalid data received from server');
          }
        }
      } catch (err) {
        setError('Failed to fetch auctions');
        console.error('Error fetching auctions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch notifications periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const notificationsData = await getNotifications(token);
          setNotifications(notificationsData);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNewAuction = (auction) => {
    setActiveAuctions(prev => [auction, ...prev]);
    // Add notification for new auction
    const notification = {
      id: Date.now(),
      type: 'new_auction',
      message: `New auction created: ${auction.title}`,
      details: {
        title: auction.title,
        basePrice: formatPrice(auction.basePrice),
        seller: auction.sellerName,
        endTime: new Date(auction.endTime).toLocaleString('en-IN')
      },
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const addBid = async (auctionId, bid) => {
    try {
      const token = localStorage.getItem('token');
      // Place the bid via backend
      await placeBid(auctionId, { bid_amount: bid.amount }, token);
      // Refetch auctions from backend
      const sellerData = JSON.parse(localStorage.getItem('sellerData'));
      if (sellerData && token) {
        const auctions = await getSellerAuctions(sellerData.id, token);
        if (Array.isArray(auctions)) {
          const active = auctions.filter(a => a.status === 'active') || [];
          const past = auctions.filter(a => a.status === 'ended') || [];
          const cancelled = auctions.filter(a => a.status === 'cancelled') || [];
          setActiveAuctions(active);
          setPastAuctions(past);
          setCancelledAuctions(cancelled);
        }
      }
      // Add notification for new bid
      const notification = {
        id: Date.now(),
        type: 'new_bid',
        message: `New bid of ${formatPrice(bid.amount)} placed`,
        details: {
          title: bid.userName,
          bidAmount: formatPrice(bid.amount),
          bidder: bid.userName
        },
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      setError('Failed to place bid. Please try again.');
      console.error('Error placing bid:', err);
    }
  };

  const moveToPastAuctions = (auction) => {
    setActiveAuctions(prev => prev.filter(a => a.id !== auction.id));
    setPastAuctions(prev => [auction, ...prev]);
    // Add notification for auction end
    const notification = {
      id: Date.now(),
      type: 'auction_end',
      message: `Auction ended: ${auction.title}`,
      details: {
        title: auction.title,
        finalBid: formatPrice(auction.currentBid),
        winner: auction.bids[auction.bids.length - 1]?.userName || 'No winner',
        seller: auction.sellerName
      },
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const moveToCancelledAuctions = async (auction) => {
    try {
      const token = localStorage.getItem('token');
      await cancelAuction(auction.id, token);
      // Refetch auctions from backend
      const sellerData = JSON.parse(localStorage.getItem('sellerData'));
      if (sellerData && token) {
        const auctions = await getSellerAuctions(sellerData.id, token);
        if (Array.isArray(auctions)) {
          const active = auctions.filter(a => a.status === 'active') || [];
          const past = auctions.filter(a => a.status === 'ended') || [];
          const cancelled = auctions.filter(a => a.status === 'cancelled') || [];
          setActiveAuctions(active);
          setPastAuctions(past);
          setCancelledAuctions(cancelled);
        }
      }
      // Add notification for cancelled auction
      const notification = {
        id: Date.now(),
        type: 'auction_cancelled',
        message: `Auction "${auction.title}" has been cancelled`,
        details: {
          title: auction.title,
          finalBid: formatPrice(auction.currentBid),
          seller: auction.sellerName
        },
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      setError('Failed to cancel auction. Please try again.');
      console.error('Error cancelling auction:', err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await markNotificationAsRead(notificationId, token);
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await clearNotificationsApi(token);
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const value = {
    activeAuctions,
    pastAuctions,
    cancelledAuctions,
    notifications,
    loading,
    error,
    addNewAuction,
    addBid,
    moveToPastAuctions,
    moveToCancelledAuctions,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

export function useAuctions() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuctions must be used within an AuctionProvider');
  }
  return context;
} 