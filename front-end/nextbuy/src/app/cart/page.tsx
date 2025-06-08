'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { useCart } from '@/app/components/context/CartContext';
import { getCart, updateCartItem, removeFromCart, clearCart, type CartItem } from '@/app/services/cartService';
import { Container, Typography, Button, Card, CardContent, Grid, IconButton, Box, useTheme, Alert, CircularProgress, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();
  const theme = useTheme();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!user || !token) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const cartData = await getCart(token);
        setCartItems(cartData.items || []);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user, token]);

  const total = cartItems.reduce((sum, item) => {
    const price = item.variant.price || item.variant.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleQuantityChange = async (variantId: string, newQuantity: number) => {
    if (!token) return;

    try {
      if (newQuantity <= 0) {
        await removeFromCart(token, variantId);
        setCartItems(prev => prev.filter(item => item.variant.id !== variantId));
        setNotification({ message: 'Item removed from cart', type: 'success' });
      } else {
        await updateCartItem(token, variantId, newQuantity);
        setCartItems(prev => prev.map(item => 
          item.variant.id === variantId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
      
      // Refresh the cart context to update navbar count
      await refreshCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
      setNotification({ message: 'Failed to update cart', type: 'error' });
    }
  };

  const handleRemoveItem = async (variantId: string) => {
    if (!token) return;

    try {
      await removeFromCart(token, variantId);
      setCartItems(prev => prev.filter(item => item.variant.id !== variantId));
      setNotification({ message: 'Item removed from cart', type: 'success' });
      
      // Refresh the cart context to update navbar count
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      setNotification({ message: 'Failed to remove item', type: 'error' });
    }
  };

  const handleClearCart = async () => {
    if (!token) return;

    try {
      await clearCart(token);
      setCartItems([]);
      setNotification({ message: 'Cart cleared', type: 'success' });
      
      // Refresh the cart context to update navbar count
      await refreshCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setNotification({ message: 'Failed to clear cart', type: 'error' });
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please login to view your cart.
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
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Your Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Card sx={{ 
          mt: 4, 
          p: 4, 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
        }}>
          <CardContent>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/products')}
              sx={{ mt: 2 }}
            >
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {cartItems.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card sx={{ 
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        {item.variant.product.images?.[0]?.url ? (
                          <Box
                            component="img"
                            src={item.variant.product.images[0].url}
                            alt={item.variant.product.name}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        ) : (
                          <Box sx={{ 
                            width: '100%', 
                            height: 80, 
                            bgcolor: 'grey.200', 
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              No Image
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h6" component="h2">
                          {item.variant.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.variant.size.name} | Color: {item.variant.color.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SKU: {item.variant.sku}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={2}>
                        <Typography variant="h6" color="primary">
                          ${(item.variant.price || item.variant.product.price).toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <IconButton 
                            onClick={() => handleQuantityChange(item.variant.id, item.quantity - 1)}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                              } 
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 2, minWidth: '2rem', textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            onClick={() => handleQuantityChange(item.variant.id, item.quantity + 1)}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                              } 
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={1}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(item.variant.id)}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 67, 54, 0.1)' 
                            } 
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Card sx={{ 
            mt: 4,
            background: 'rgba(255, 255, 255, 0.05)',
          }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Total: ${total.toFixed(2)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleClearCart}
                    startIcon={<DeleteIcon />}
                  >
                    Clear Cart
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => router.push('/checkout')}
                    startIcon={<ShoppingCartIcon />}
                  >
                    Proceed to Checkout
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
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