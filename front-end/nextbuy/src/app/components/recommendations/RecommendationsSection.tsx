'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import {
  getRecommendationsForUser,
  getGeneralRecommendations,
  RecommendedProduct
} from '@/app/services/recommendationService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Chip,
  Button
} from '@mui/material';
import Link from 'next/link';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface RecommendationsSectionProps {
  title?: string;
  maxItems?: number;
  showViewMore?: boolean;
}

export default function RecommendationsSection({
  title,
  maxItems = 8,
  showViewMore = true
}: RecommendationsSectionProps) {
  const { user, token } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        let data: RecommendedProduct[];
        
        if (user && token) {
          // Get personalized recommendations
          data = await getRecommendationsForUser(token, maxItems);
        } else {
          // Get general recommendations for non-logged users
          data = await getGeneralRecommendations(maxItems);
        }
        
        setRecommendations(data);
      } catch (error) {
        setError('Failed to load recommendations');
        console.error('Recommendations error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, token, maxItems]);

  // loading process 
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const sectionTitle = title || (user ? 'Recommended for You' : 'Popular Products');
  const sectionIcon = user ? <AutoAwesomeIcon /> : <TrendingUpIcon />;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {sectionIcon}
        <Typography variant="h5" component="h2" sx={{ ml: 1, fontWeight: 'bold' }}>
          {sectionTitle}
        </Typography>
        {user && (
          <Chip
            label="Personalized"
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {recommendations.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <Link
                href={`/products/${product.id}`}
                style={{ textDecoration: 'none' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.images && product.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="180"
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
                    height: 180,
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

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Chip
                  label={product.category}
                  size="small"
                  sx={{ mb: 1 }}
                  color="secondary"
                  variant="outlined"
                />
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {/* noreferrer doesn't send information to the new window 
                  and no openner doesn't allow the new window to access the opener window
                  */}
                  <Link
                    href={`/products/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    target="_blank"
                    rel="noopener noreferrer" 
                  >
                    {product.name}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description.length > 60
                    ? `${product.description.substring(0, 60)}...`
                    : product.description
                  }
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                  {product.reviews && product.reviews.length > 0 && (
                    <Chip
                      label={`${product.reviews.length} reviews`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {showViewMore && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.open('/products', '_blank')}
          >
            View All Products
          </Button>
        </Box>
      )}
    </Box>
  );
} 