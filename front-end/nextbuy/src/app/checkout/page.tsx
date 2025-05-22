'use client';

import { useCartStore } from '@/app/components/cart/cartStore';
import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Grid,
  Divider,
    
} from '@mui/material';
import { createOrder } from '../services/createOrder';
import { useRouter } from 'next/navigation';
export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // state for validation
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    paymentMethod: 'creditCard',
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }


  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.paymentMethod) return "Payment method is required";
    return '';
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    


    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const orderData = {
      items,
      total,
      shippingDetails: {
        fullName: formData.fullName,
        address: formData.address,
        phone: formData.phone,
      },
      paymentMethod: formData.paymentMethod,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await createOrder(orderData, token);
      setSuccess(true);
      clearCart();
      setFormData({
        fullName: '',
        address: '',
        phone: '',
        paymentMethod: 'creditCard',
      });
      setTimeout(() => {
        router.push('/'); // this redirects to the home page after the order
      }, 2000);
   
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
    
  };


  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Checkout
      </Typography>
      {items.length === 0 ? (
        <Card sx={{ mt: 4, p: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6">Your cart is empty</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products')}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                {items.map((item) => (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item>
                        <Typography>
                          {item.name} x {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }}>
                  <Grid container justifyContent="space-between">
                    <Grid item>
                      <Typography variant="h6">
                        Total
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" color="primary">
                        ${total.toFixed(2)}
                      </Typography>
                    </Grid>
                    </Grid>
                    </Divider>
              </CardContent>
              </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Order placed successfully! Redirecting...</Alert>}
                <Box component="form" onSubmit={handleOrder} >
                  <TextField
                    label="Full Name"
                    name="fullName"
                    fullWidth
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Address"
                    name="address"
                    fullWidth
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Phone"
                    name="phone"
                    fullWidth
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend">Payment Method</FormLabel>
                    <RadioGroup
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    >
                      <FormControlLabel
                        value="creditCard"
                        control={<Radio />}
                        label="Pay With Card"
                      />
                      <FormControlLabel
                        value="cash"
                        control={<Radio />}
                        label="Cash On Delivery"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          </Grid>
      )}
    </Container>
  );
}