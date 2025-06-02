'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../cart/cartStore';
import { 
  Badge, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  useTheme,
  TextField,
  InputAdornment
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '@/app/components/context/AuthContext';

export default function Navbar() {
  const { items } = useCartStore();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(26, 35, 126, 0.8)',
    }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          href="/" 
          sx={{ 
            flexGrow: 0, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '0.5px',
            marginRight: 3,
            '&:hover': {
              color: theme.palette.primary.light,
            },
          }}
        >
          NextBuy
        </Typography>

        {/* Search Bar */}
        <Box 
          component="form" 
          onSubmit={handleSearch}
          sx={{ 
            flexGrow: 1, 
            maxWidth: 400,
            mx: 3
          }}
        >
          <TextField
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& ::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 0 }}>
          <Button 
            color="inherit" 
            component={Link} 
            href="/products"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Products
          </Button>
          {user && (
            <Button 
              color="inherit" 
              component={Link} 
              href="/wishlist"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Wishlist
            </Button>
          )}
          <IconButton 
            color="inherit" 
            component={Link} 
            href="/cart"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Badge badgeContent={cartItemsCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {user ? (
            <>
              <Typography variant="body1" sx={{ mx: 1 }}>
                Hello {user.name || user.email}!
              </Typography>
              <IconButton 
                color="inherit" 
                component={Link} 
                href="/orders"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                title="My Orders"
              >
                <ReceiptIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                component={Link} 
                href="/profile"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                title="My Profile"
              >
                <PersonIcon />
              </IconButton>
              {user.role === 'ADMIN' && (
                <IconButton 
                  color="inherit" 
                  component={Link} 
                  href="/admin"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  title="Admin Panel"
                >
                  <AdminPanelSettingsIcon />
                </IconButton>
              )}
              <IconButton 
                color="inherit" 
                onClick={logout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
              <>
            <IconButton 
              color="inherit" 
              component={Link} 
              href="/auth/login"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <LoginIcon />
                </IconButton>
                <Button
                  color="inherit"
                  component={Link}
                  href="/auth/register"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  }}
                >
                  Register
                </Button>
                </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}