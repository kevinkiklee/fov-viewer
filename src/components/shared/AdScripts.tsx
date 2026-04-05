// Loads the Google AdSense library globally. Rendered in layout.tsx <body>.
// The library auto-discovers <ins class="adsbygoogle"> elements on the page
// and fills them after each AdUnit pushes to window.adsbygoogle.
// Uses "afterInteractive" so it doesn't block page hydration.

import Script from 'next/script'
import { getAdsenseClient } from '@/lib/ads'

export function AdScripts() {
  const client = getAdsenseClient()

  if (!client) return null

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  )
}
