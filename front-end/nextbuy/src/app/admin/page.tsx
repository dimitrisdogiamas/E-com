'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { adminService, DashboardStats } from '@/app/services/adminService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart,
  People,
  TrendingUp,
  AttachMoney,
  PendingActions,
  Category,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (!token) {
          router.push('/auth/login');
          return;
        }

        if (user?.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        const dashboardData = await adminService.getDashboardStats(token);
        setStats(dashboardData);
      } catch (error) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [user, token, router]);

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

  if (!user || user.role !== 'ADMIN') {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
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

  if (!stats) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Failed to load dashboard data'}
        </Alert>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <ShoppingCart fontSize="large" />,
      color: 'primary.main',
      action: () => router.push('/admin/products'),
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <TrendingUp fontSize="large" />,
      color: 'info.main',
      action: () => router.push('/admin/orders'),
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People fontSize="large" />,
      color: 'success.main',
      action: () => router.push('/admin/users'),
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <PendingActions fontSize="large" />,
      color: 'warning.main',
      action: () => router.push('/admin/orders'),
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <AttachMoney fontSize="large" />,
      color: 'success.main',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: <AttachMoney fontSize="large" />,
      color: 'info.main',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your e-commerce platform
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: stat.action ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': stat.action ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                } : {}
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Recent Orders
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {stats.recentOrders.map((order, index) => (
                  <ListItem key={order.id} divider={index < stats.recentOrders.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            Order #{order.orderNumber}
                          </Typography>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.user.name} - ${order.totalAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/admin/orders')}
                >
                  View All Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Category sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Top Categories
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {stats.topCategories.map((category, index) => (
                  <ListItem key={category.category} divider={index < stats.topCategories.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {category.category}
                          </Typography>
                          <Chip
                            label={`${category.count} products`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/admin/products')}
                >
                  Manage Products
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/admin/products')}
              sx={{ py: 2 }}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/admin/orders')}
              sx={{ py: 2 }}
            >
              View Orders
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/admin/users')}
              sx={{ py: 2 }}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push('/')}
              sx={{ py: 2 }}
            >
              Back to Store
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 