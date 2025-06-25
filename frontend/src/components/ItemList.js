import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, ended

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setItems(response.data);
        setLoading(false);
      } catch (error) {
        alert('Failed to fetch items');
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isEnded = new Date(item.end_time) < new Date();
    
    if (filter === 'active') return matchesSearch && !isEnded;
    if (filter === 'ended') return matchesSearch && isEnded;
    return matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Active Auctions
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search items"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Items</MenuItem>
                <MenuItem value="active">Active Auctions</MenuItem>
                <MenuItem value="ended">Ended Auctions</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {filteredItems.map(item => {
            const isEnded = new Date(item.end_time) < new Date();
            const timeLeft = new Date(item.end_time) - new Date();
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="h2" noWrap>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={isEnded ? "Ended" : "Active"} 
                        color={isEnded ? "error" : "success"}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description.length > 100 
                        ? `${item.description.substring(0, 100)}...` 
                        : item.description}
                    </Typography>
                    
                    <Typography variant="h6" color="primary" gutterBottom>
                      Current Price: ${item.current_price.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Seller: {item.seller}
                    </Typography>
                    
                    {!isEnded && (
                      <Typography variant="body2" color="text.secondary">
                        Time Left: {hoursLeft > 0 ? `${hoursLeft} hours` : 'Less than an hour'}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      Ends: {new Date(item.end_time).toLocaleString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/items/${item.id}`}
                      variant="contained" 
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          
          {filteredItems.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" color="text.secondary">
                No items found
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default ItemList; 