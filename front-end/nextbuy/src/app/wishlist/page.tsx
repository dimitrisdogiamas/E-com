'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/app/services/wishlistService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Button
} from '@mui/material';
import { Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Remove from wishlist error:', error);
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
      <Typography variant="h4" component="h1" gutterBottom>
        My Wishlist
      </Typography>
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
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      size="small"
                      component={Link}
                      href={`/products/${item.product.id}`}
                    >
                      View Product
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
    </Container>
  );
} 