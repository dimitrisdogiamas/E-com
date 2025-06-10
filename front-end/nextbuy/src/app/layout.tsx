import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from './components/ClientLayout';

export const metadata: Metadata = {
  title: 'NextBuy - E-commerce Store',
  description: 'Your premium e-commerce destination',
  icons: {
    icon: '/favicon.ico',
    apple: '/next.svg',
  },
}

export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}