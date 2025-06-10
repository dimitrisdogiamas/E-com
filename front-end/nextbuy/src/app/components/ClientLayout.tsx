'use client';

import { AuthProvider } from '@/app/components/context/AuthContext';
import { CartProvider } from '@/app/components/context/CartContext';
import { StripeProvider } from '@/app/components/context/StripeContext';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme';
import Navbar from './layout/Navbar';
import { Footer } from './layout/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <StripeProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </StripeProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 