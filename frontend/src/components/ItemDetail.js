import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Alert,
  Box,
  Chip,
} from '@mui/material';

function ItemDetail() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/items/${itemId}`);
        setItem(res.data.item);
        setBids(res.data.bids);
      } catch (err) {
        setError('Failed to load item details');
      }
    };
    fetchItem();
  }, [itemId]);

  const handleBid = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await API.post(`/items/${itemId}/bid`, { bid_amount: parseFloat(bidAmount) });
      setSuccess('Bid placed successfully!');
      setBidAmount('');
      // Refresh bids
      const res = await API.get(`/items/${itemId}`);
      setBids(res.data.bids);
      setItem(res.data.item);
    } catch (err) {
      setError(err.response?.data?.error || 'Bid failed');
    }
  };

  const isAuctionEnded = item && new Date(item.end_time) < new Date();
  const isUserSeller = item && token && item.seller_id === JSON.parse(atob(token.split('.')[1])).id;

  if (!item) return (
    <Container>
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>Loading...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1" gutterBottom>
                {item.name}
              </Typography>
              <Chip 
                label={isAuctionEnded ? "Auction Ended" : "Active Auction"} 
                color={isAuctionEnded ? "error" : "success"}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Item Details</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Seller" 
                  secondary={item.seller}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Current Price" 
                  secondary={`$${item.current_price.toFixed(2)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Starting Price" 
                  secondary={`$${item.starting_price.toFixed(2)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="End Time" 
                  secondary={new Date(item.end_time).toLocaleString()}
                />
              </ListItem>
            </List>
          </Grid>

          {token && !isAuctionEnded && !isUserSeller && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Place Your Bid</Typography>
                <form onSubmit={handleBid}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bid Amount"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    inputProps={{ 
                      min: item.current_price + 1,
                      step: "0.01"
                    }}
                    helperText={`Minimum bid: $${(item.current_price + 1).toFixed(2)}`}
                    margin="normal"
                    required
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Place Bid
                  </Button>
                </form>
              </Paper>
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Bidding History</Typography>
            <List>
              {bids.length > 0 ? (
                bids.map((bid, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={`$${bid.amount.toFixed(2)}`}
                      secondary={`Bid by ${bid.bidder} at ${new Date(bid.bid_time).toLocaleString()}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No bids yet" />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ItemDetail; 