'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { getMyOrders, cancelOrder, Order } from '@/app/services/orderService';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const ordersData = await getMyOrders(token);
        setOrders(ordersData);
      } catch (error) {
        setError('Failed to load orders');
        console.error('Orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user, token, router]);

  const handleCancelOrder = async () => {
    if (!orderToCancel || !token) return;

    setCancelling(true);
    try {
      await cancelOrder(orderToCancel, token);
      
      // Update the order status in the local state
      setOrders(prev => prev.map(order => 
        order.id === orderToCancel 
          ? { ...order, status: 'CANCELLED' as const }
          : order
      ));
      
      setNotification({ message: 'Order cancelled successfully', type: 'success' });
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Cancel order error:', error);
      setNotification({ message: 'Failed to cancel order', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const openCancelDialog = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

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
          Please login to view your order history.
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <ShoppingBagIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            My Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your order history
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't placed any orders yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products')}
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card sx={{ 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Order Info */}
                    <Grid item xs={12} md={3}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Order #{order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} md={2}>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        icon={getStatusIcon(order.status)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Grid>

                    {/* Total */}
                    <Grid item xs={12} md={2}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <PaymentIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {order.paymentMethod}
                      </Typography>
                    </Grid>

                    {/* Shipping Info */}
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {order.shippingFullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {order.shippingAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {order.shippingPhone}
                      </Typography>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                        {order.status === 'PENDING' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => openCancelDialog(order.id)}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Summary Section */}
      {orders.length > 0 && (
        <Paper elevation={1} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {orders.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">
                ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Pending Orders
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="warning.main">
                {orders.filter(order => order.status === 'PENDING').length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Delivered Orders
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="success.main">
                {orders.filter(order => order.status === 'DELIVERED').length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            Keep Order
          </Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error" 
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={20} /> : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <Alert 
          severity={notification?.type} 
          onClose={() => setNotification(null)}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 