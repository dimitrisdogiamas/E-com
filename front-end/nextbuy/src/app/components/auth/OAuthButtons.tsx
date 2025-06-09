'use client';

import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

interface OAuthButtonsProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ 
  disabled = false, 
  isLoading = false 
}) => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mx: 2, fontSize: '0.875rem' }}
        >
          Or continue with
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          borderColor: 'divider',
          color: 'text.primary',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'primary.main',
          },
          '&:disabled': {
            opacity: 0.6,
          },
        }}
      >
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>

      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 2,
          lineHeight: 1.4,
        }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Typography>
    </Box>
  );
};

export default OAuthButtons; 