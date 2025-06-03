'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box,
  Alert 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log error to error reporting service here
    // logErrorToService(error, errorInfo);
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="error" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                We're sorry for the inconvenience
              </Typography>
            </Box>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details style={{ marginTop: '10px' }}>
                  <summary>Error Details (Development only)</summary>
                  <pre style={{ 
                    fontSize: '12px', 
                    marginTop: '10px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {this.state.error?.stack}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                startIcon={<HomeIcon />}
              >
                Go Home
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              If this problem persists, please contact support.
            </Typography>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 