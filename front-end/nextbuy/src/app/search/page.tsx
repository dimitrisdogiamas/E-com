'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProducts, SearchFilters, Product } from '@/app/services/searchService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: undefined,
    maxPrice: undefined,
  });
  
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Categories for the filter dropdown
  const categories = [
    'All Categories',
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Toys',
    'Automotive'
  ];

  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const searchFilters: SearchFilters = {
        query: filters.query,
        category: filters.category === 'All Categories' ? undefined : filters.category,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      };
      
      const results = await searchProducts(searchFilters);
      setProducts(results);
      
      // Update URL with search parameters
      const params = new URLSearchParams();
      if (searchFilters.query) params.set('q', searchFilters.query);
      if (searchFilters.category) params.set('category', searchFilters.category);
      if (searchFilters.minPrice) params.set('minPrice', searchFilters.minPrice.toString());
      if (searchFilters.maxPrice) params.set('maxPrice', searchFilters.maxPrice.toString());
      
      router.replace(`/search?${params.toString()}`, { scroll: false });
    } catch (error) {
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
    });
    setPriceRange([0, 1000]);
    setProducts([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'All Categories') count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    return count;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <SearchIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Search Products
        </Typography>
        
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for products..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                performSearch();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={performSearch}
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>

        {/* Filter Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ position: 'relative' }}
          >
            Filters
            {getActiveFiltersCount() > 0 && (
              <Chip
                size="small"
                label={getActiveFiltersCount()}
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Button>
          
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="text"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              color="secondary"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Filters Panel */}
        {showFilters && (
          <Paper elevation={1} sx={{ mt: 3, p: 3, backgroundColor: 'grey.50' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category || 'All Categories'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                  valueLabelFormat={(value) => `$${value}`}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={performSearch}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {loading ? 'Searching...' : `${products.length} results found`}
          {filters.query && (
            <span> for "{filters.query}"</span>
          )}
        </Typography>
      </Box>

      {/* Results Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                  <CardContent sx={{ flexGrow: 1 }}>
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
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
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
      ) : !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or filters
          </Typography>
          <Button variant="contained" onClick={() => router.push('/products')}>
            Browse All Products
          </Button>
        </Paper>
      )}
    </Container>
  );
} 