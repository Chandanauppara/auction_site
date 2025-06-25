import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

function CreateItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    starting_price: '',
    end_time: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newErrors = {};
    const now = new Date();
    const endTime = new Date(formData.end_time);

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      newErrors.starting_price = 'Starting price must be greater than 0';
    }
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (endTime <= now) {
      newErrors.end_time = 'End time must be in the future';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await axios.post('/api/items', {
        ...formData,
        starting_price: parseFloat(formData.starting_price),
      });
      setSuccess(response.data.message);
      setFormData({ name: '', description: '', starting_price: '', end_time: '' });
      setTimeout(() => navigate('/items'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Auction Item
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Starting Price"
                name="starting_price"
                type="number"
                value={formData.starting_price}
                onChange={handleChange}
                error={!!errors.starting_price}
                helperText={errors.starting_price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: "0.01",
                  step: "0.01"
                }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleChange}
                error={!!errors.end_time}
                helperText={errors.end_time}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16)
                }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/items')}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Create Item
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateItem; 