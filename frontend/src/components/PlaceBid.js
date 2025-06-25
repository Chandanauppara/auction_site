import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PlaceBid() {
  const { itemId } = useParams();
  const [bidAmount, setBidAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/items/${itemId}/bid`, { bid_amount: parseFloat(bidAmount) });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to place bid');
    }
  };

  return (
    <div>
      <h2>Place Bid for Item {itemId}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bid Amount:</label>
          <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required />
        </div>
        <button type="submit">Place Bid</button>
      </form>
    </div>
  );
}

export default PlaceBid; 