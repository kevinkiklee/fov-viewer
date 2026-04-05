import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { JsonLd } from '@/components/shared/JsonLd'
import { AdScripts } from '@/components/shared/AdScripts'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.site')
  const description = t('description')
  const ogTitle = t('ogTitle')
  return {
    metadataBase: new URL('https://www.phototools.io'),
    title: { default: t('defaultTitle'), template: t('titleTemplate') },
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: 'https://www.phototools.io',
      siteName: 'PhotoTools',
      locale: 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description },
    alternates: { canonical: '/' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  const siteT = await getTranslations('metadata.site')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PhotoTools',
    url: 'https://www.phototools.io',
    description: siteT('description'),
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Consent-first ad loading: these scripts MUST be in <head> and load BEFORE
            AdSense (in <body> via AdScripts). Order matters:
            1. gtag consent defaults — deny all storage types until user consents
            2. CookieYes — renders consent banner, fires gtag('consent','update',...)
               when user accepts, which unlocks ad_storage/analytics_storage
            Both env vars required — see isAdsEnabled() in lib/ads.ts */}
        {process.env.NEXT_PUBLIC_COOKIEYES_ID && process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);`,
              }}
            />
            <script
              id="cookieyes"
              type="text/javascript"
              src={`https://cdn-cookieyes.com/client_data/${process.env.NEXT_PUBLIC_COOKIEYES_ID}/script.js`}
            />
          </>
        )}
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AdScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <JsonLd />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ViewTransition>
              {children}
            </ViewTransition>
          </ThemeProvider>
        </NextIntlClientProvider>

        <SpeedInsights />
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
