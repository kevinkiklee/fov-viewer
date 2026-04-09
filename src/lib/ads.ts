// Ad system overview:
// - AdScripts (layout.tsx)  — loads the AdSense library globally via next/script
// - AdUnit                  — renders an individual <ins> ad slot; used in page sidebars and MobileAdBanner
// - MobileAdBanner          — sticky bottom banner on mobile, dismissible per session
// - CookieYes (layout.tsx <head>) — consent manager; must load BEFORE AdSense so ads
//   respect consent. The gtag consent-default script denies all storage until CookieYes
//   fires a consent update. Ads require BOTH env vars to be set (see isAdsEnabled).
//
// Slot IDs are currently empty strings ("") — ads won't render until real
// AdSense slot IDs are configured. See AdUnit: it returns null when slot is falsy.

// Standard IAB ad sizes used by Google AdSense
export type AdFormat = 'rectangle' | 'leaderboard' | 'mobile-banner'

export const AD_FORMATS: Record<AdFormat, { width: number; height: number }> = {
  rectangle: { width: 300, height: 250 },   // sidebar / in-content
  leaderboard: { width: 728, height: 90 },  // wide horizontal banner
  'mobile-banner': { width: 320, height: 50 }, // sticky mobile bottom (MobileAdBanner)
}

// Trim whitespace/newlines and treat empty strings as undefined. Guards against
// env vars with trailing newlines (a common footgun when the value is copied
// from a terminal heredoc or multi-line `.env` entry), which otherwise get
// URL-encoded into the AdSense request as %0A and produce a 400 response.
function readEnv(key: string): string | undefined {
  const raw = process.env[key]
  if (!raw) return undefined
  const trimmed = raw.trim()
  return trimmed || undefined
}

export function getAdsenseClient(): string | undefined {
  return readEnv('NEXT_PUBLIC_ADSENSE_CLIENT') // ca-pub-XXXX publisher ID
}

export function getCookieyesId(): string | undefined {
  return readEnv('NEXT_PUBLIC_COOKIEYES_ID') // CookieYes site identifier
}

// Both AdSense AND CookieYes must be configured — we never serve ads without consent management
export function isAdsEnabled(): boolean {
  return Boolean(getAdsenseClient()) && Boolean(getCookieyesId())
}
