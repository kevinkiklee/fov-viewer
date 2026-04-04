import Script from 'next/script'
import { getAdsenseClient, getCookieyesId, isAdsEnabled } from '@/lib/ads'

export function AdScripts() {
  if (!isAdsEnabled()) return null

  const client = getAdsenseClient()
  const cookieyesId = getCookieyesId()

  return (
    <>
      {/* Google Consent Mode v2 defaults — must run before any Google tags */}
      <Script id="consent-mode-defaults" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);`}
      </Script>

      {/* CookieYes CMP — must load before Google tags to intercept cookies */}
      <Script
        id="cookieyes"
        src={`https://cdn-cookieyes.com/client_data/${cookieyesId}/script.js`}
        strategy="beforeInteractive"
      />

      {/* Google AdSense */}
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  )
}
