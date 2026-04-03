import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.phototools.io'),
  title: {
    default: 'PhotoTools — Free Photography Tools',
    template: '%s | PhotoTools',
  },
  description: 'Free browser-based photography tools: FOV viewer, DoF calculator, exposure simulator, and more. No sign-up, runs entirely in your browser.',
  openGraph: {
    title: 'PhotoTools — Free Photography Tools',
    description: 'Free browser-based photography tools: FOV viewer, DoF calculator, exposure simulator, and more.',
    url: 'https://www.phototools.io',
    siteName: 'PhotoTools',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PhotoTools - Interactive Photography Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoTools — Free Photography Tools',
    description: 'Free browser-based photography tools: FOV viewer, DoF calculator, exposure simulator, and more.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PhotoTools',
    url: 'https://www.phototools.io',
    description: 'Free browser-based photography calculators, simulators, and references.',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-B0QND42GRG"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-B0QND42GRG');
            `
          }}
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <JsonLd />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
