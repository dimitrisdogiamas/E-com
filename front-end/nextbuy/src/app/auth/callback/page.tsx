'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/components/context/AuthContext';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { CheckCircle as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';

type CallbackState = 'loading' | 'success' | 'error';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [state, setState] = useState<CallbackState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const userParam = searchParams.get('user');

        if (error) {
          setState('error');
          setMessage(decodeURIComponent(error));
          return;
        }

        if (!token || !userParam) {
          setState('error');
          setMessage('Missing authentication data from OAuth provider');
          return;
        }

        // Parse user data
        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
        } catch (parseError) {
          setState('error');
          setMessage('Invalid user data received from OAuth provider');
          return;
        }

        // Login the user with the received token and data
        await login(userData.email, '', token, userData);
        
        setState('success');
        setMessage(`Welcome back, ${userData.name || userData.email}!`);
        
        // Redirect after successful login
        setTimeout(() => {
          const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectTo);
        }, 2000);

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setState('error');
        setMessage(error.message || 'An unexpected error occurred during authentication');
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Completing your sign-in...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your authentication
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <SuccessIcon 
              sx={{ 
                fontSize: 60, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom color="success.main">
              Sign-in Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Redirecting you now...
            </Typography>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon 
              sx={{ 
                fontSize: 60, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom color="error.main">
              Sign-in Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              {message}
            </Alert>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                mt: 3, 
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => router.push('/auth/login')}
            >
              Return to Login
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card 
        elevation={3}
        sx={{ 
          borderRadius: 2,
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              NextBuy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              OAuth Authentication
            </Typography>
          </Box>

          {renderContent()}
        </CardContent>
      </Card>

      {/* Footer */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 3 
        }}
      >
        Having trouble? Contact our support team.
      </Typography>
    </Container>
  );
} 