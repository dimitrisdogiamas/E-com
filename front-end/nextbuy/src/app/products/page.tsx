'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from '@/app/services/productService';
import Grid from '@mui/material/Grid';
import { Container, Card, CardContent, CardMedia, Typography, CircularProgress, Alert, Box } from '@mui/material';
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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch the data from the getallproducts function

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <Link 
              href={`/products/${product.id}`}
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {product.images && product.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="250"
                  image={product.images[0].url}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.setAttribute('style', 'display: flex');
                  }}
                />
              ) : null}
              
              {/* Fallback for missing images */}
              <Box
                sx={{
                  height: 250,
                  backgroundColor: '#f5f5f5',
                  display: product.images && product.images.length > 0 ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="body2">No Image Available</Typography>
              </Box>
            </Link>
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2">
                <Link 
                  href={`/products/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {product.name}
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.category}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {product.description.length > 100 
                  ? `${product.description.substring(0, 100)}...` 
                  : product.description
                }
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                ${product.price.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        ))}
      </Grid>
    </Container>
  )
}