import './globals.css'

import Navbar from './components/layout/Navbar';
import { Footer }  from './components/layout/Footer';

export const metadata = {
  title: 'NextBuy',
  description: 'Your favourite online shopping platform',
};


export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}