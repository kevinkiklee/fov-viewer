'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from '@/lib/i18n/navigation'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'

const GTAG_INIT_SNIPPET = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('js',new Date());gtag('config','G-B0QND42GRG');`
import { Analytics } from '@vercel/analytics/next'
import { getToolBySlug } from '@/lib/data/tools'
import { initPostHog, upgradePostHog, downgradePostHog } from '../providers/posthog'
import { updateGA4Consent, trackGA4PageView } from '../providers/ga4'
import { initMeta, setMetaEnabled, getMetaPixelId, trackMeta } from '../providers/meta'
import { getConsentState, onConsentChange, getDevConsentOverride } from '../consent'
import { setGlobalProperties, trackPageView } from '../index'
import type { ConsentState } from '../consent'
import type { GlobalProperties, ViewportType } from '../types'
import * as Sentry from '@sentry/nextjs'

function getViewportType(): ViewportType {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

function extractToolSlug(pagePath: string): string | null {
  const segments = pagePath.split('/').filter(Boolean)
  const slug = segments[0] || null
  if (!slug) return null
  return getToolBySlug(slug) ? slug : null
}

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const initializedRef = useRef(false)
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    if (!navigator.webdriver) {
      setEnabled(true)
    }
  }, [])

  // Inject gtag bootstrap via DOM rather than rendering <script> in JSX.
  // Because `enabled` flips from false → true inside the effect above, the
  // AnalyticsProvider re-renders post-hydration with the script tags. React 19
  // warns (and refuses to execute) scripts that first appear in a client
  // component after the initial render. DOM injection sidesteps both issues
  // while preserving the load order (init snippet must run before gtag.js so
  // window.dataLayer is ready to queue commands).
  useEffect(() => {
    if (!enabled) return
    if (document.getElementById('phototools-gtag-loader')) return

    const init = document.createElement('script')
    init.id = 'phototools-gtag-init'
    init.textContent = GTAG_INIT_SNIPPET
    document.head.appendChild(init)

    const loader = document.createElement('script')
    loader.id = 'phototools-gtag-loader'
    loader.async = true
    loader.src = 'https://www.googletagmanager.com/gtag/js?id=G-B0QND42GRG'
    document.head.appendChild(loader)
  }, [enabled])

  useEffect(() => {
    if (!enabled || initializedRef.current) return
    initializedRef.current = true

    initPostHog()

    const devOverride = getDevConsentOverride()
    if (devOverride) {
      applyConsent(devOverride)
    } else {
      const existing = getConsentState()
      if (existing.analytics || existing.marketing) {
        applyConsent(existing)
      }
    }

    const cleanupConsent = onConsentChange((state) => applyConsent(state))

    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as Record<string, unknown>).__analytics = {
        grantConsent: (category: string) => {
          const current = getConsentState()
          applyConsent({
            analytics: category === 'analytics' ? true : current.analytics,
            marketing: category === 'marketing' ? true : current.marketing,
          })
        },
        revokeConsent: (category: string) => {
          const current = getConsentState()
          applyConsent({
            analytics: category === 'analytics' ? false : current.analytics,
            marketing: category === 'marketing' ? false : current.marketing,
          })
        },
        getState: () => getConsentState(),
      }
    }

    return () => {
      cleanupConsent()
    }
  }, [enabled])

  function applyConsent(state: ConsentState) {
    if (state.analytics) {
      upgradePostHog()
      updateGA4Consent('analytics', true)
      setAnalyticsConsent(true)
    } else {
      downgradePostHog()
      updateGA4Consent('analytics', false)
      setAnalyticsConsent(false)
    }

    if (state.marketing) {
      updateGA4Consent('marketing', true)
      setMarketingConsent(true)
    } else {
      setMetaEnabled(false)
      updateGA4Consent('marketing', false)
      setMarketingConsent(false)
    }
  }

  useEffect(() => {
    if (!enabled) return
    const toolSlug = extractToolSlug(pathname)
    const tool = toolSlug ? getToolBySlug(toolSlug) : null
    const props: GlobalProperties = {
      locale,
      page_path: `/${locale}${pathname}`,
      viewport_type: getViewportType(),
      tool_slug: toolSlug,
      tool_category: tool?.category || null,
    }
    setGlobalProperties(props)
    Sentry.setContext('phototools', {
      tool_slug: toolSlug,
      tool_category: tool?.category || null,
      locale,
      viewport_type: getViewportType(),
    })
  }, [locale, pathname, enabled])

  useEffect(() => {
    if (!enabled) return
    if (prevPathnameRef.current === pathname) return
    prevPathnameRef.current = pathname

    const fullPath = `/${locale}${pathname}`
    const title = document.title
    trackPageView({ page_path: fullPath, page_title: title })
    trackGA4PageView(fullPath, title)
  }, [pathname, locale, enabled])

  useEffect(() => {
    if (!enabled || !marketingConsent) return
    const toolSlug = extractToolSlug(pathname)
    if (!toolSlug) return
    const tool = getToolBySlug(toolSlug)
    if (!tool) return
    trackMeta('ViewContent', { content_name: toolSlug, content_category: tool.category })
  }, [pathname, enabled, marketingConsent])

  // Suppress the analyticsConsent state read warning — it's consumed by the
  // consent effect above and intentionally kept for future conditional rendering.
  void analyticsConsent

  if (!enabled) return <>{children}</>

  const metaPixelId = getMetaPixelId()

  return (
    <Sentry.ErrorBoundary fallback={<>{children}</>}>
      {children}
      <SpeedInsights />
      <Analytics />
      {/* GTM/gtag is injected via DOM in the effect above rather than via
          next/script or React <script> JSX. next/script emits a preload hint
          that fires the browser's "preloaded but not used" warning, and
          rendering <script> in a client component after hydration triggers
          React 19's "scripts inside React components are never executed"
          warning. DOM injection avoids both. */}
      {marketingConsent && metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          onLoad={() => initMeta()}
        >
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`}
        </Script>
      )}
    </Sentry.ErrorBoundary>
  )
}
