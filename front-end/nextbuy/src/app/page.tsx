'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from './services/productService';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { useRouter } from 'next/navigation';
import RecommendationsSection from './components/recommendations/RecommendationsSection';
import { ProductCard } from './components/product/ProductCard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AnimatedButton } from './components/ui/AnimatedButton';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

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
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getAllProducts()
      .then((products) => {
        // Show first 8 products as featured
        setFeaturedProducts(products.slice(0, 8));
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

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
                  onAddToCart={(productId) => {
                    // TODO: Implement add to cart
                    console.log('Add to cart:', productId);
                  }}
                  onToggleWishlist={(productId) => {
                    // TODO: Implement wishlist toggle
                    console.log('Toggle wishlist:', productId);
                  }}
                  isInWishlist={false}
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
    </Container>
  );
}