'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/app/services/productService';
import {
  Container, Card, CardContent, Typography,
  CircularProgress, Alert, Button, Grid,
  IconButton, Snackbar, Box
} from '@mui/material';
import { useCartStore } from '@/app/components/cart/cartStore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        ...product,
        id: Number(product.id),
        quantity
      });
      setShowSnackbar(true);
    }
  };

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!product) return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Category: {product.category}
              </Typography>
              <Typography variant="body2" paragraph>
                {product.description}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add to Cart
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => handleQuantityChange(-1)}>
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                <IconButton onClick={() => handleQuantityChange(1)}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                fullWidth
                size="large"
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push('/products')}
                fullWidth
                sx={{ mt: 2 }}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message="Product added to cart"
        action={
          <Button color="secondary" size="small" onClick={() => router.push('/cart')}>
            View Cart
          </Button>
        }
      />
    </Container>
  );
}