import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ErrorProvider } from '@/lib/errors/ErrorContext';
import { PageErrorBoundary } from '@/components/errors/ErrorBoundary';
import { SkipLink } from '@/components/ui/Accessibility';
import AccessibilityTester from '@/components/dev/AccessibilityTester';
import { PerformanceOptimizer } from '@/components/performance/PerformanceOptimizer';
import { ServiceWorkerManager } from '@/components/performance/ServiceWorkerManager';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { HelpProvider } from '@/components/help/HelpProvider';
import { DiscoveryProvider } from '@/components/discovery/DiscoveryProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SolidityLearn" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ErrorProvider>
            <HelpProvider>
              <DiscoveryProvider>
                <PageErrorBoundary>
                  <PerformanceOptimizer page="homepage">
                    {/* Skip Links for Keyboard Navigation */}
                    <SkipLink href="#main-content">Skip to main content</SkipLink>
                    <SkipLink href="#navigation">Skip to navigation</SkipLink>

                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                      {/* Navigation with semantic landmark */}
                      <Navigation />

                      {/* Main content with semantic landmark and skip target */}
                      <main id="main-content" className="relative" role="main" tabIndex={-1}>
                        {children}
                      </main>

                      {/* Footer with semantic landmark */}
                      <Footer />
                    </div>
                  </PerformanceOptimizer>
                </PageErrorBoundary>
                <Toaster />

                {/* Development Accessibility Tester */}
                <AccessibilityTester />

                {/* Service Worker Manager */}
                <ServiceWorkerManager />

                {/* Performance Monitor */}
                <PerformanceMonitor />
              </DiscoveryProvider>
            </HelpProvider>
          </ErrorProvider>
        </Providers>
      </body>
    </html>
  );
}
