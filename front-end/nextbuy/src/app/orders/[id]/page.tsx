'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { getOrderById, Order } from '@/app/services/orderService';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter, useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!token) {
          router.push('/auth/login');
          return;
        }
        if (!orderId) {
          setError('Order ID not found');
          return;
        }
        const orderData = await getOrderById(orderId, token);
        setOrder(orderData);
      } catch (error) {
        setError('Failed to load order details');
        console.error('Order error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token && orderId) {
      loadOrder();
    } else if (!user) {
      setError('Please login to view order details');
      setLoading(false);
    }
  }, [user, token, orderId, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SHIPPED':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <CalendarTodayIcon />;
      case 'SHIPPED':
        return <LocalShippingIcon />;
      case 'DELIVERED':
        return <ShoppingBagIcon />;
      case 'CANCELLED':
        return <PaymentIcon />;
      default:
        return <ShoppingBagIcon />;
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please login to view order details.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Order not found'}
        </Alert>
        <Button 
          onClick={() => router.push('/orders')} 
          sx={{ mt: 2 }}
          variant="outlined"
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label={order.status}
            color={getStatusColor(order.status) as any}
            icon={getStatusIcon(order.status)}
            sx={{ fontWeight: 'bold', fontSize: '1rem', p: 2 }}
          />
        </Box>
        <Button 
          onClick={() => router.push('/orders')} 
          variant="outlined"
          sx={{ mr: 2 }}
        >
          ← Back to Orders
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                <ShoppingBagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Order Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {order.items && order.items.length > 0 ? (
                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            Item #{item.variantId}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Price per item: ${item.price.toFixed(2)}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                              Subtotal: ${(item.quantity * item.price).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items found for this order.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary & Shipping */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {order.paymentMethod}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Amount:
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Shipping Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
                  Full Name:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', ml: 3 }}>
                  {order.shippingFullName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HomeIcon sx={{ fontSize: 16, mr: 1 }} />
                  Address:
                </Typography>
                <Typography variant="body1" sx={{ ml: 3 }}>
                  {order.shippingAddress}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, mr: 1 }} />
                  Phone:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', ml: 3 }}>
                  {order.shippingPhone}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      {order.status === 'PENDING' && (
        <Paper elevation={1} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Need to make changes?
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="large"
            sx={{ mr: 2 }}
          >
            Cancel Order
          </Button>
          <Button
            variant="outlined"
            size="large"
          >
            Contact Support
          </Button>
        </Paper>
      )}
    </Container>
  );
} 