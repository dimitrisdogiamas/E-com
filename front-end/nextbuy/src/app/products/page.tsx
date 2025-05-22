'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from '@/app/services/productService';
import Grid from '@mui/material/Grid';
import { Container,  Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';



type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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
        <Grid item xs={12} sm={6} md={4} key={product.id} >
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2">
                  <Link href={`/products/${product.id}`}>
                    {product.name}
                  </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.category}
              </Typography>
              <Typography>
                {product.description}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {product.price} $
              </Typography>
            </CardContent>
          </Card>
        </Grid >
        ))}
      </Grid>
    </Container>
  )
 
}