import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolanaLearn - Master Solidity Development',
  description: 'The most comprehensive Solidity learning platform with AI-powered tutoring, real-time collaboration, and hands-on blockchain development.',
  keywords: ['Solidity', 'Blockchain', 'Smart Contracts', 'Web3', 'Ethereum', 'DeFi', 'Learning Platform'],
  authors: [{ name: 'SolanaLearn Team' }],
  openGraph: {
    title: 'SolanaLearn - Master Solidity Development',
    description: 'Learn Solidity with AI-powered tutoring and real-time collaboration',
    url: 'https://solanalearn.dev',
    siteName: 'SolanaLearn',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SolanaLearn Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolanaLearn - Master Solidity Development',
    description: 'Learn Solidity with AI-powered tutoring and real-time collaboration',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navigation />
            <main className="relative">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
