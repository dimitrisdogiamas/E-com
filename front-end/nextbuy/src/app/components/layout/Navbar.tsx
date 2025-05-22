'use client';

import Link from 'next/link';
import { useCartStore } from '../cart/cartStore';
import { Badge, AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { items } = useCartStore();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '0.5px',
            '&:hover': {
              color: theme.palette.primary.light,
            },
          }}
        >
          NextBuy
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              <IconButton 
                color="inherit" 
                component={Link} 
                href="/profile"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <PersonIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                onClick={logout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
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
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}