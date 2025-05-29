'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from './services/productService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        // Show first 4 products as featured
        setFeaturedProducts(products.slice(0, 4));
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome To NextBuy
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Discover the latest trends in clothing and accessories
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/products')}
          sx={{
            backgroundColor: 'white',
            color: '#667eea',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)'
            }
          }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Featured Products
        </Typography>
        {featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    {product.images && product.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.images[0].url}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        sx={{ mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description.length > 60 
                          ? `${product.description.substring(0, 60)}...` 
                          : product.description
                        }
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Link>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No products available at the moment.</Alert>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/products')}
          >
            View All Products
          </Button>
        </Box>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          backgroundColor: '#f8f9fa',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Join us Today!
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          Sign up now and get exclusive discounts on your first order
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => router.push('/auth/register')}
        >
          Sign Up Now
        </Button>
      </Box>
    </Container>
  );
}