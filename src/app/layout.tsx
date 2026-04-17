import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/responsive.css';
import { getSiteUrl } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Skolr | Tanzania online learning for Primary to University',
    template: '%s | Skolr',
  },
  description: 'Skolr helps learners in Tanzania study from Primary to University with structured video lessons, NECTA-aligned learning paths, and parent-friendly progress tracking.',
  applicationName: 'Skolr',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Skolr' },
  keywords: ['Skolr', 'Tanzania education', 'online learning', 'NECTA', 'primary lessons', 'secondary lessons', 'form six lessons'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Skolr',
    title: 'Skolr | Tanzania online learning for Primary to University',
    description: 'Structured video lessons, exam-ready learning paths, and parent-friendly progress tracking for Tanzania learners.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skolr | Tanzania online learning for Primary to University',
    description: 'Structured video lessons and learning paths for Tanzania learners from Primary to University.',
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body style={{ backgroundColor: '#111111', color: '#ffffff', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
