import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.phototools.io'),
  title: {
    default: 'PhotoTools — Free Photography Tools',
    template: '%s | PhotoTools',
  },
  description: 'Free browser-based photography tools: FOV viewer, DoF calculator, exposure simulator, and more. No sign-up required — your photos never leave your browser.',
  openGraph: {
    title: 'PhotoTools — Free Photography Tools',
    description: 'Free browser-based photography tools: field of view simulator, color scheme generator, exif viewer, and more.',
    url: 'https://www.phototools.io',
    siteName: 'PhotoTools',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoTools — Free Photography Tools',
    description: 'Free browser-based photography tools: field of view simulator, color scheme generator, exif viewer, and more.',
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
    description: 'Free browser-based photography visualizers, simulators, and references.',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <JsonLd />
        <ThemeProvider>
          <ViewTransition>
            {children}
          </ViewTransition>
        </ThemeProvider>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B0QND42GRG"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-B0QND42GRG');`}
        </Script>
      </body>
    </html>
  )
}
