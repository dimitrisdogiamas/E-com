'use client';

import './globals.css'
import Navbar from './components/layout/Navbar';
import { Footer }  from './components/layout/Footer';
import { AuthProvider } from '@/app/components/context/AuthContext';
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
      <body className="flex flex-col min-h-screen bg-[#121212]">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}