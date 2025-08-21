'use client';
import { useEffect, useState } from 'react';
import { getAllProducts } from '@/app/services/productService';
import { addProductToCart } from '@/app/services/cartService';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/app/services/wishlistService';
import { useAuth } from '@/app/components/context/AuthContext';
import { useCart } from '@/app/components/context/CartContext';
import { ProductCard } from '@/app/components/product/ProductCard';
import Grid from '@mui/material/Grid';
import { Container, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';

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

export default function ProductsPage() {
  const { user, token } = useAuth();
  const { refreshCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all products
        const allProducts = await getAllProducts();
        setProducts(allProducts);

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
        console.error('Failed to load products:', error);
        setError('Failed to load products');
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
      // Find the product name for the success message
      const product = products.find(p => p.id === productId);
      
      // Use the helper function that automatically handles variants
      await addProductToCart(productId, 1, token);
      
      // Refresh the cart context to update the cart count in navbar
      await refreshCart();
      
      setNotification({ message: `${product?.name || 'Product'} added to cart!`, type: 'success' });
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setNotification({ message: errorMessage, type: 'error' });
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

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      
      <Grid container spacing={3}>
        {products.map((product) => (
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

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        message={notification?.message}
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
  )
}