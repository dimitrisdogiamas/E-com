'use client';

import './globals.css'
import Navbar from './components/layout/Navbar';
import { Footer }  from './components/layout/Footer';
import { AuthProvider } from '@/app/components/context/AuthContext';
import { StripeProvider } from '@/app/components/context/StripeContext';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ErrorBoundary>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <StripeProvider>
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </StripeProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}