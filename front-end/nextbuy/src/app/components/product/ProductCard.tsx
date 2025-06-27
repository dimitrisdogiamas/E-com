'use client';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Rating,
  Button,
  Fade
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Link from 'next/link';
import { useState } from 'react';
import { ProductStockBadge } from './StockIndicator';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: { url: string }[];
    averageRating?: number;
    reviewCount?: number;
    variants?: {
      id: string;
      stock: number;
      sku: string;
    }[];
  };
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate total stock from all variants
  const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0;
  const hasStock = totalStock > 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wishlist Icon */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
        onClick={() => onToggleWishlist?.(product.id)}
      >
        {isInWishlist ? (
          <FavoriteIcon sx={{ color: 'error.main' }} />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>

      {/* Product Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <CardMedia
            component="img"
            height="240"
            image={product.images?.[0]?.url || '/placeholder-image.png'}
            alt={product.name}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
        </Link>

        {/* Category Badge */}
        <Chip
          label={product.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontWeight: 600,
          }}
        />

        {/* Stock Badge */}
        {product.variants && product.variants.length > 0 && (
          <ProductStockBadge stock={totalStock} />
        )}

        {/* Quick Add to Cart Button */}
        <Fade in={isHovered}>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => onAddToCart?.(product.id)}
            disabled={!hasStock}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              opacity: hasStock ? 1 : 0.6,
            }}
          >
            {hasStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Fade>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {product.name}
          </Typography>
        </Link>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {product.description}
        </Typography>

        {/* Rating */}
        {product.averageRating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.averageRating}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};
