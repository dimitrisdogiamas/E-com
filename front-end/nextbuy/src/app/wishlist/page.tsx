'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { useCart } from '@/app/components/context/CartContext';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/app/services/wishlistService';
import { addProductToCart } from '@/app/services/cartService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
  Box,
  Button,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon, ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React from 'react';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

Alert.displayName = 'Alert';

export default function WishlistPage() {
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (!token) return;
        const items = await getWishlist(token);
        setWishlistItems(items);
      } catch (error) {
        setError('Failed to load wishlist');
        console.error('Wishlist error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      if (!token) return;
      await removeFromWishlist(productId, token);
      setWishlistItems(items => items.filter(item => item.productId !== productId));
      setNotification({ message: 'Removed from wishlist', type: 'success' });
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Remove from wishlist error:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!token) {
      setNotification({ message: 'Please login to add to cart', type: 'error' });
      return;
    }

    setAddingToCart(productId);
    try {
      //calling the function to add the product to the cart
      await addProductToCart(productId, 1, token);
      await refreshCart();
      setNotification({ message: 'Added to cart successfully', type: 'success' });
    } catch (error) {
      console.error('Add to cart error:', error);
      setNotification({ message: 'Failed to add to cart', type: 'error' });
    } finally {
      setAddingToCart(null);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!token) {
      setNotification({ message: 'Please login to proceed', type: 'error' });
      return;
    }

    if (wishlistItems.length === 0) {
      setNotification({ message: 'Your wishlist is empty', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Add all wishlist items to cart
      for (const item of wishlistItems) {
        await addProductToCart(item.productId, 1, token);
      }
      
      // Refresh cart and redirect to checkout
      await refreshCart();
      setNotification({ message: 'All items added to cart!', type: 'success' });
      
      // Wait a moment for the notification to show
      setTimeout(() => {
        router.push('/checkout');
      }, 1000);
    } catch (error) {
      console.error('Proceed to checkout error:', error);
      setNotification({ message: 'Failed to add items to cart', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  //redirect to login page if user is not logged in
  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please <Link href="/auth/login">login</Link> to view your wishlist.
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

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Wishlist ({wishlistItems.length} items)
        </Typography>
        
        {wishlistItems.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartOutlined />}
            onClick={handleProceedToCheckout}
            disabled={loading}
            sx={{
              minWidth: 180,
              height: 48,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {loading ? 'Adding to Cart...' : 'Proceed to Checkout'}
          </Button>
        )}
      </Box>

    {/* if the wishList is empty it redirects to the products page */}
      {wishlistItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Button
            component={Link}
            href="/products"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.product.images && item.product.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.product.images[0].url}
                    alt={item.product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    <Link
                      href={`/products/${item.product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {item.product.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.product.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${item.product.price}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      href={`/products/${item.product.id}`}
                      sx={{ flex: 1 }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      size="small"
                      onClick={() => handleAddToCart(item.productId)}
                      disabled={addingToCart === item.productId}
                      sx={{ flex: 1 }}
                    >
                      {addingToCart === item.productId ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notification?.type || 'info'}
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 