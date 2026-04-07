export type ConsentState = {
  analytics: boolean
  marketing: boolean
}

export function getConsentState(): ConsentState {
  if (typeof document === 'undefined') return { analytics: false, marketing: false }

  try {
    const match = document.cookie.match(/cookieyes-consent=([^;]+)/)
    if (!match) return { analytics: false, marketing: false }

    const decoded = decodeURIComponent(match[1])
    return {
      analytics: decoded.includes('analytics:yes'),
      marketing: decoded.includes('advertisement:yes'),
    }
  } catch {
    return { analytics: false, marketing: false }
  }
}

export function onConsentChange(
  callback: (state: ConsentState) => void,
): () => void {
  function handler() {
    callback(getConsentState())
  }

  document.addEventListener('cookieyes_consent_update', handler)
  return () => document.removeEventListener('cookieyes_consent_update', handler)
}

export function getDevConsentOverride(): ConsentState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const consent = params.get('analytics_consent')
  if (!consent) return null

  const categories = consent.split(',').map((c) => c.trim())
  return {
    analytics: categories.includes('analytics'),
    marketing: categories.includes('marketing'),
  }
}
