'use client';

import { useCartStore } from "../components/cart/cartStore";
import { Container, Typography, Button, Card, CardContent, Grid, IconButton, Box, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity } = useCartStore();
  const router = useRouter();
  const theme = useTheme();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

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
      {items.length === 0 ? (
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
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card sx={{ 
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="h6" color="primary">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <IconButton 
                            onClick={() => handleQuantityChange(item.id, -1)}
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
                            onClick={() => handleQuantityChange(item.id, 1)}
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
                      <Grid item xs={12} sm={2}>
                        <IconButton 
                          color="error" 
                          onClick={() => removeItem(item.id)}
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
                    onClick={clearCart}
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
    </Container>
  );
} 