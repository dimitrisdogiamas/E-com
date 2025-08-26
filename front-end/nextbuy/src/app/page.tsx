'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from '@/app/services/productService';
import { addToCart } from '@/app/services/cartService';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/app/services/wishlistService';
import { useAuth } from '@/app/components/context/AuthContext';
import { useCart } from '@/app/components/context/CartContext';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Snackbar
} from '@mui/material';
import { useRouter } from 'next/navigation';
import RecommendationsSection from './components/recommendations/RecommendationsSection';
import { ProductCard } from './components/product/ProductCard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AnimatedButton } from './components/ui/AnimatedButton';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Link from 'next/link';

type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: ProductImage[];
  averageRating?: number;
  reviewCount?: number;
};

export default function HomePage() {
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load featured products (first 8 products)
        const products = await getAllProducts();
        setFeaturedProducts(products.slice(0, 8));

        // Load wishlist if user is logged in
        if (user && token) {
          try {
            const wishlistData = await getWishlist(token);
            const wishlistProductIds = wishlistData.map((item: any) => item.product.id);
            setWishlistItems(wishlistProductIds);
          } catch (wishlistError) {
            console.warn('Could not load wishlist:', wishlistError);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token]);

  const handleAddToCart = async (productId: string) => {
    if (!user || !token) {
      setNotification({ message: 'Please login to add items to cart', type: 'error' });
      return;
    }

    try {
      // Find the product to get its first variant
      const product = featuredProducts.find(p => p.id === productId);
      if (!product) {
        setNotification({ message: 'Product not found', type: 'error' });
        return;
      }

      // For now, we'll get the first available variant
      // In a real app, user would select size/color first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-a996.up.railway.app'}/products/${productId}`);
      const productDetails = await response.json();
      
      if (productDetails.variants && productDetails.variants.length > 0) {
        const firstVariant = productDetails.variants[0];
        await addToCart(token, firstVariant.id, 1);
        
        // Refresh the cart context to update the cart count in navbar
        await refreshCart();
        
        setNotification({ message: `${product.name} added to cart!`, type: 'success' });
      } else {
        setNotification({ message: 'No variants available for this product', type: 'error' });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      setNotification({ message: 'Failed to add item to cart', type: 'error' });
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user || !token) {
      setNotification({ message: 'Please login to manage wishlist', type: 'error' });
      return;
    }

    try {
      const isInWishlist = wishlistItems.includes(productId);
      
      if (isInWishlist) {
        await removeFromWishlist(productId, token);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        setNotification({ message: 'Removed from wishlist', type: 'success' });
      } else {
        await addToWishlist(productId, token);
        setWishlistItems(prev => [...prev, productId]);
        setNotification({ message: 'Added to wishlist', type: 'success' });
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      setNotification({ message: 'Failed to update wishlist', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading NextBuy..." />;
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          mb: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome To NextBuy
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              opacity: 0.95,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover premium fashion with cutting-edge technology. 
            Your style, redefined.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <AnimatedButton
              variant="contained"
              size="large"
              startIcon={<ShoppingBagIcon />}
              onClick={() => router.push('/products')}
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.95)'
                }
              }}
            >
              Shop Collection
            </AnimatedButton>
            
            <AnimatedButton
              variant="outlined"
              size="large"
              startIcon={<TrendingUpIcon />}
              onClick={() => router.push('/products')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Trending Now
            </AnimatedButton>
          </Stack>

          {/* Feature highlights */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Chip 
              icon={<StarIcon />}
              label="Premium Quality" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Chip 
              label="Free Shipping" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Chip 
              label="30-Day Returns" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Stack>
        </Box>
      </Box>

      {/* Enhanced Featured Products Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Products
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Handpicked selections from our premium collection
          </Typography>
        </Box>

        {featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={wishlistItems.includes(product.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              fontSize: '1.1rem'
            }}
          >
            No products available at the moment.
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <AnimatedButton
            variant="outlined"
            size="large"
            onClick={() => router.push('/products')}
            sx={{ px: 4, py: 1.5 }}
          >
            Explore All Products
          </AnimatedButton>
        </Box>
      </Box>

      {/* Recommendations Section */}
      <RecommendationsSection />

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        action={
          <Alert 
            severity={notification?.type} 
            onClose={() => setNotification(null)}
            sx={{ minWidth: 'auto' }}
          >
            {notification?.message}
          </Alert>
        }
      />
    </Container>
  );
}