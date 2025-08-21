'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/app/services/productService';
import {
  Container, Card, CardContent, Typography,
  CircularProgress, Alert, Button, Grid,
  IconButton, Snackbar, Box, CardMedia,
  Chip, Divider
} from '@mui/material';
import { useAuth } from '@/app/components/context/AuthContext';
import { useCart } from '@/app/components/context/CartContext';
import { addProductToCart } from '@/app/services/cartService';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    if (!token) {
      setError('Please login to add items to cart');
      return;
    }

    if (product) {
      setAddingToCart(true);
      try {
        await addProductToCart(product.id, quantity, token);
        await refreshCart();
        setShowSnackbar(true);
        setError(""); // Clear any previous errors
      } catch (error) {
        console.error('Add to cart error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
        setError(errorMessage);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>
  if (!product && !loading) return <Container sx={{ mt: 4 }}><Alert severity="error">Product not found</Alert></Container>
  if (!product) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            {product.images && product.images.length > 0 ? (
              <>
                <CardMedia
                  component="img"
                  height="400"
                  image={product.images[selectedImageIndex]?.url || product.images[0].url}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                {product.images.length > 1 && (
                  <Box sx={{ p: 2, display: 'flex', gap: 1, overflow: 'auto' }}>
                    {product.images.map((image, index) => (
                      <Box
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          width: 80,
                          height: 80,
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: selectedImageIndex === index ? '2px solid primary.main' : '2px solid transparent',
                          borderRadius: 1,
                          overflow: 'hidden',
                          '&:hover': {
                            border: '2px solid primary.light'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="76"
                          image={image.url}
                          alt={`${product.name} ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  height: 400,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary" variant="h6">
                  No Images Available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ flexGrow: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Chip 
                  label={product.category} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {product.name}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ${product.price.toFixed(2)}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {!user && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please <Button onClick={() => router.push('/auth/login')}>login</Button> to add items to cart
                  </Alert>
                )}
                
                <Typography variant="h6" gutterBottom>
                  Quantity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 3, minWidth: '3rem', textAlign: 'center', fontSize: '1.2rem' }}>
                    {quantity}
                  </Typography>
                  <IconButton 
                    onClick={() => handleQuantityChange(1)}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={addingToCart ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={addingToCart || !user}
                  fullWidth
                  size="large"
                  sx={{ mb: 2, py: 1.5 }}
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push('/products')}
                  fullWidth
                  size="large"
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message="Product added to cart successfully!"
        action={
          <Button color="secondary" size="small" onClick={() => router.push('/cart')}>
            View Cart
          </Button>
        }
      />
    </Container>
  );
}