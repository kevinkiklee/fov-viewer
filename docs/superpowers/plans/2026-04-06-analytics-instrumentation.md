# Analytics Instrumentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add comprehensive user behavior tracking using PostHog (behavior/replays), Meta Pixel (attribution), and expanded GA4 — with tiered consent, centralized analytics service, and event instrumentation across all components.

**Architecture:** Centralized analytics service under `src/lib/analytics/` with typed event taxonomy, consent manager that integrates with existing CookieYes, and provider fan-out to PostHog/GA4/Meta. Components call semantic tracking functions — never provider SDKs directly.

**Tech Stack:** posthog-js, Meta Pixel (script injection), GA4 gtag (existing), CookieYes (existing), React hooks, Next.js Script component

**Spec:** `docs/superpowers/specs/2026-04-06-analytics-instrumentation-design.md`

---

## File Map

### New Files (create)

```
src/lib/analytics/
  types.ts                    Event taxonomy — all event names and typed properties
  debug.ts                    Console logger for dev mode
  consent.ts                  CookieYes consent state reader + listener
  error-tracking.ts           Global error handlers + trackError()
  providers/
    posthog.ts                PostHog init/track/upgrade/downgrade
    ga4.ts                    GA4 gtag wrapper
    meta.ts                   Meta Pixel wrapper
  hooks/
    useDebouncedTracker.ts    Debounced tool interaction tracking
    useScrollDepth.ts         Scroll tracking with rAF throttle
    useToolSession.ts         Tool session timing + exit snapshot
  components/
    AnalyticsProvider.tsx     SDK init, consent, SPA pageviews, global props
    AnalyticsErrorBoundary.tsx React error boundary
  index.ts                    Public API — dispatch + semantic track functions

  # Test files (co-located)
  types.test.ts
  consent.test.ts
  debug.test.ts
  error-tracking.test.ts
  providers/posthog.test.ts
  providers/ga4.test.ts
  providers/meta.test.ts
  hooks/useDebouncedTracker.test.ts
  hooks/useScrollDepth.test.ts
  hooks/useToolSession.test.ts
  index.test.ts
```

### Modified Files

```
package.json                              Add posthog-js dependency
next.config.ts                            Add CSP domains + /phog/* rewrites
src/app/robots.ts                         Add Disallow: /phog/
src/app/[locale]/layout.tsx               Replace AnalyticsScripts with AnalyticsProvider
src/components/layout/Nav.tsx             Add data attributes + trackNavClick
src/components/layout/Footer.tsx          Add data attributes + trackNavClick
src/components/shared/LearnPanel.tsx      Add useScrollDepth + section view tracking
src/components/shared/ChallengeCard.tsx   Add challenge_start + attempt_number
src/components/shared/ShareModal.tsx      Add trackShareClick
src/components/shared/LanguageSwitcher.tsx Add trackLanguageSwitch
src/components/layout/ThemeToggle.tsx     Add trackThemeToggle
src/components/shared/FileDropZone.tsx    Add file upload tracking
src/components/shared/MobileAdBanner.tsx  Add mobile_ad_dismiss tracking
src/components/shared/AdUnit.tsx          Add ad_slot_visible tracking
src/components/shared/ScenePicker.tsx     Add scene picker tracking
src/app/[locale]/page.tsx                 Add data-ph-capture-attribute-* to tool cards
src/app/[locale]/learn/glossary/_components/Glossary.tsx  Add glossary tracking
src/app/[locale]/contact/_components/ContactForm.tsx      Add form submit + data-ph-no-capture
src/e2e/smoke/all-pages.spec.ts           Add PostHog/Meta to benign error filter
```

### Deleted Files

```
src/lib/analytics.ts                      Replaced by src/lib/analytics/index.ts
src/components/layout/AnalyticsScripts.tsx Replaced by AnalyticsProvider
```

---

## Task 1: Install posthog-js and create event taxonomy types

**Files:**
- Modify: `package.json`
- Create: `src/lib/analytics/types.ts`
- Create: `src/lib/analytics/types.test.ts`

- [ ] **Step 1: Install posthog-js**

```bash
npm install posthog-js
```

- [ ] **Step 2: Write the types test**

```ts
// src/lib/analytics/types.test.ts
import { describe, it, expect } from 'vitest'
import type {
  AnalyticsEvent,
  ToolInteractionEvent,
  ToolEngagedEvent,
  ToolSessionSummaryEvent,
  ScrollDepthEvent,
  LearnPanelOpenEvent,
  LearnPanelSectionViewEvent,
  ChallengeStartEvent,
  ChallengeCompleteEvent,
  NavClickEvent,
  ShareClickEvent,
  LanguageSwitchEvent,
  ThemeToggleEvent,
  OutboundClickEvent,
  MobileMenuToggleEvent,
  MobileControlsToggleEvent,
  GlossarySearchEvent,
  GlossaryEntryViewEvent,
  ContactFormSubmitEvent,
  FileUploadEvent,
  FileUploadErrorEvent,
  JsErrorEvent,
  WebGLErrorEvent,
  CapabilityCheckEvent,
  AdSlotVisibleEvent,
  MobileAdDismissEvent,
  PageViewEvent,
  GlobalProperties,
  InputType,
  ConsentCategory,
} from './types'

describe('analytics types', () => {
  it('ToolInteractionEvent is well-typed', () => {
    const event: ToolInteractionEvent = {
      param_name: 'aperture',
      param_value: 'f/2.8',
      input_type: 'select',
    }
    expect(event.input_type).toBe('select')
  })

  it('InputType covers all input types', () => {
    const types: InputType[] = ['slider', 'select', 'toggle', 'button', 'scene-picker', 'text-input']
    expect(types).toHaveLength(6)
  })

  it('ConsentCategory covers analytics and marketing', () => {
    const cats: ConsentCategory[] = ['analytics', 'marketing']
    expect(cats).toHaveLength(2)
  })

  it('GlobalProperties has required fields', () => {
    const props: GlobalProperties = {
      locale: 'en',
      page_path: '/en/fov-simulator',
      viewport_type: 'desktop',
      tool_slug: 'fov-simulator',
      tool_category: 'visualizer',
    }
    expect(props.locale).toBe('en')
  })

  it('AnalyticsEvent discriminated union compiles', () => {
    const event: AnalyticsEvent = {
      name: 'tool_interaction',
      properties: { param_name: 'focal_length', param_value: '85', input_type: 'slider' },
    }
    expect(event.name).toBe('tool_interaction')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/lib/analytics/types.test.ts
```
Expected: FAIL — module `./types` not found.

- [ ] **Step 4: Create types.ts**

```ts
// src/lib/analytics/types.ts

export type InputType = 'slider' | 'select' | 'toggle' | 'button' | 'scene-picker' | 'text-input'
export type ConsentCategory = 'analytics' | 'marketing'
export type ViewportType = 'mobile' | 'desktop'

// --- Global properties (auto-enriched by dispatcher) ---

export type GlobalProperties = {
  locale: string
  page_path: string
  viewport_type: ViewportType
  tool_slug: string | null
  tool_category: string | null
}

// --- Event property types ---

export type ToolInteractionEvent = {
  param_name: string
  param_value: string
  input_type: InputType
}

export type ToolEngagedEvent = {
  tool_slug: string
  duration_seconds: number
}

export type ToolSessionSummaryEvent = {
  tool_slug: string
  duration_seconds: number
  interaction_count: number
  final_params?: Record<string, string> // PostHog only (JSON)
  param_count?: number                  // GA4 only
  primary_param?: string                // GA4 only
}

export type ScrollDepthEvent = {
  depth_percent: 25 | 50 | 75 | 100
  viewport_type?: ViewportType
}

export type LearnPanelOpenEvent = Record<string, never>

export type LearnPanelSectionViewEvent = {
  section: 'beginner' | 'deeper' | 'factors' | 'tips'
}

export type ChallengeStartEvent = {
  challenge_id: string
  difficulty: string
}

export type ChallengeCompleteEvent = {
  challenge_id: string
  difficulty: string
  correct: boolean
  attempt_number: number
}

export type NavClickEvent = {
  target: string
  source: 'mega-menu' | 'footer' | 'homepage-card'
}

export type ShareClickEvent = {
  method: 'copy-link' | 'embed' | 'markdown' | 'bbcode'
}

export type LanguageSwitchEvent = {
  from_locale: string
  to_locale: string
}

export type ThemeToggleEvent = {
  new_theme: 'light' | 'dark'
}

export type OutboundClickEvent = {
  url: string
  link_text: string
  source: 'learn-panel' | 'footer' | 'nav'
}

export type MobileMenuToggleEvent = {
  action: 'open' | 'close'
}

export type MobileControlsToggleEvent = {
  action: 'open' | 'close'
}

export type GlossarySearchEvent = {
  search_term: string
  results_count: number
}

export type GlossaryEntryViewEvent = {
  term_id: string
}

export type ContactFormSubmitEvent = Record<string, never>

export type FileUploadEvent = {
  file_type: string
  file_size_kb: number
}

export type FileUploadErrorEvent = {
  error_type: string
  file_type: string
}

export type JsErrorEvent = {
  message: string
  source?: string
  line?: number
  column?: number
}

export type WebGLErrorEvent = {
  error_type: string
}

export type CapabilityCheckEvent = {
  feature: 'webgl2' | 'canvas'
  supported: boolean
}

export type AdSlotVisibleEvent = {
  slot_id: string
  format: string
  viewport_type: ViewportType
}

export type MobileAdDismissEvent = {
  time_before_dismiss_seconds: number
}

export type PageViewEvent = {
  page_path: string
  page_title: string
}

// --- Discriminated union of all events ---

export type AnalyticsEvent =
  | { name: 'tool_interaction'; properties: ToolInteractionEvent }
  | { name: 'tool_engaged'; properties: ToolEngagedEvent }
  | { name: 'tool_session_summary'; properties: ToolSessionSummaryEvent }
  | { name: 'page_scroll_depth'; properties: ScrollDepthEvent }
  | { name: 'learn_panel_scroll_depth'; properties: ScrollDepthEvent }
  | { name: 'learn_panel_open'; properties: LearnPanelOpenEvent }
  | { name: 'learn_panel_section_view'; properties: LearnPanelSectionViewEvent }
  | { name: 'challenge_start'; properties: ChallengeStartEvent }
  | { name: 'challenge_complete'; properties: ChallengeCompleteEvent }
  | { name: 'nav_click'; properties: NavClickEvent }
  | { name: 'share_click'; properties: ShareClickEvent }
  | { name: 'language_switch'; properties: LanguageSwitchEvent }
  | { name: 'theme_toggle'; properties: ThemeToggleEvent }
  | { name: 'outbound_click'; properties: OutboundClickEvent }
  | { name: 'mobile_menu_toggle'; properties: MobileMenuToggleEvent }
  | { name: 'mobile_controls_toggle'; properties: MobileControlsToggleEvent }
  | { name: 'glossary_search'; properties: GlossarySearchEvent }
  | { name: 'glossary_entry_view'; properties: GlossaryEntryViewEvent }
  | { name: 'contact_form_submit'; properties: ContactFormSubmitEvent }
  | { name: 'file_upload'; properties: FileUploadEvent }
  | { name: 'file_upload_error'; properties: FileUploadErrorEvent }
  | { name: 'js_error'; properties: JsErrorEvent }
  | { name: 'webgl_error'; properties: WebGLErrorEvent }
  | { name: 'capability_check'; properties: CapabilityCheckEvent }
  | { name: 'ad_slot_visible'; properties: AdSlotVisibleEvent }
  | { name: 'mobile_ad_dismiss'; properties: MobileAdDismissEvent }
  | { name: 'page_view'; properties: PageViewEvent }

// Type helper: extract properties type from event name
export type EventProperties<N extends AnalyticsEvent['name']> =
  Extract<AnalyticsEvent, { name: N }>['properties']

// Provider targets per event — used by dispatcher to route events
export type ProviderTarget = 'posthog' | 'ga4' | 'meta'

// Events that should fire to Meta Pixel (with their fbq event name)
export const META_EVENT_MAP: Partial<Record<AnalyticsEvent['name'], { type: 'standard' | 'custom'; fbqName: string }>> = {
  page_view: { type: 'standard', fbqName: 'PageView' },
  share_click: { type: 'custom', fbqName: 'ShareClick' },
  glossary_search: { type: 'standard', fbqName: 'Search' },
  tool_engaged: { type: 'custom', fbqName: 'ToolEngaged' },
  challenge_complete: { type: 'custom', fbqName: 'ChallengeCompleted' },
}

// Events that should NOT fire to GA4 (PostHog-only)
export const POSTHOG_ONLY_EVENTS: Set<AnalyticsEvent['name']> = new Set([
  'theme_toggle',
  'mobile_menu_toggle',
  'mobile_controls_toggle',
])
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/lib/analytics/types.test.ts
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics/types.ts src/lib/analytics/types.test.ts package.json package-lock.json
git commit -m "feat(analytics): install posthog-js and create event taxonomy types"
```

---

## Task 2: Create debug logger and consent manager

**Files:**
- Create: `src/lib/analytics/debug.ts`
- Create: `src/lib/analytics/debug.test.ts`
- Create: `src/lib/analytics/consent.ts`
- Create: `src/lib/analytics/consent.test.ts`

- [ ] **Step 1: Write debug tests**

```ts
// src/lib/analytics/debug.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { debugLog, isDebugEnabled } from './debug'

describe('debug', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('isDebugEnabled returns true in development', () => {
    expect(isDebugEnabled()).toBe(true) // vitest runs with NODE_ENV=test
  })

  it('debugLog logs event name and providers in non-production', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    debugLog('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8', input_type: 'select' }, {
      posthog: true,
      ga4: true,
      meta: false,
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('[Analytics]')
    expect(spy.mock.calls[0][0]).toContain('tool_interaction')
  })
})
```

- [ ] **Step 2: Create debug.ts**

```ts
// src/lib/analytics/debug.ts

type ProviderStatus = {
  posthog: boolean
  ga4: boolean
  meta: boolean
}

export function isDebugEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function debugLog(
  eventName: string,
  properties: Record<string, unknown>,
  providers: ProviderStatus,
): void {
  if (!isDebugEnabled()) return

  const phStatus = providers.posthog ? 'OK' : 'blocked'
  const gaStatus = providers.ga4 ? 'OK' : 'blocked'
  const metaStatus = providers.meta ? 'OK' : 'blocked'

  console.log(
    `[Analytics] ${eventName} -> PostHog ${phStatus}, GA4 ${gaStatus}, Meta ${metaStatus}`,
    properties,
  )
}
```

- [ ] **Step 3: Run debug tests**

```bash
npx vitest run src/lib/analytics/debug.test.ts
```
Expected: PASS

- [ ] **Step 4: Write consent tests**

```ts
// src/lib/analytics/consent.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getConsentState, onConsentChange, type ConsentState } from './consent'

describe('consent', () => {
  beforeEach(() => {
    // Clean up any CookieYes globals
    delete (window as Record<string, unknown>).__cookieyes_consent
    vi.restoreAllMocks()
  })

  afterEach(() => {
    delete (window as Record<string, unknown>).__cookieyes_consent
  })

  it('returns all-denied when CookieYes is not loaded', () => {
    const state = getConsentState()
    expect(state.analytics).toBe(false)
    expect(state.marketing).toBe(false)
  })

  it('reads existing consent from CookieYes cookie', () => {
    // Simulate CookieYes consent cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'cookieyes-consent={stamp:%27test%27,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes}',
    })
    const state = getConsentState()
    expect(state.analytics).toBe(true)
    expect(state.marketing).toBe(true)
  })

  it('calls listener on consent change', () => {
    const listener = vi.fn()
    const cleanup = onConsentChange(listener)

    // Simulate CookieYes consent update event
    const event = new CustomEvent('cookieyes_consent_update', {
      detail: { accepted: ['analytics'], rejected: ['advertisement'] },
    })
    document.dispatchEvent(event)

    expect(listener).toHaveBeenCalledTimes(1)
    cleanup()
  })
})
```

- [ ] **Step 5: Create consent.ts**

```ts
// src/lib/analytics/consent.ts
import type { ConsentCategory } from './types'

export type ConsentState = {
  analytics: boolean
  marketing: boolean
}

/**
 * Parse the `cookieyes-consent` cookie to determine current consent state.
 * CookieYes stores a URL-encoded JSON object with category: yes/no values.
 */
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

/**
 * Listen for CookieYes consent changes. Returns cleanup function.
 * CookieYes fires `cookieyes_consent_update` on document when user
 * accepts or modifies consent preferences.
 */
export function onConsentChange(
  callback: (state: ConsentState) => void,
): () => void {
  function handler() {
    callback(getConsentState())
  }

  document.addEventListener('cookieyes_consent_update', handler)
  return () => document.removeEventListener('cookieyes_consent_update', handler)
}

/**
 * Dev-mode consent simulation. Checks `?analytics_consent=analytics,marketing`
 * query param. Returns null if not in dev mode or no param present.
 */
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
```

- [ ] **Step 6: Run consent tests**

```bash
npx vitest run src/lib/analytics/consent.test.ts
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/analytics/debug.ts src/lib/analytics/debug.test.ts src/lib/analytics/consent.ts src/lib/analytics/consent.test.ts
git commit -m "feat(analytics): add debug logger and consent manager"
```

---

## Task 3: Create analytics providers

**Files:**
- Create: `src/lib/analytics/providers/posthog.ts`
- Create: `src/lib/analytics/providers/posthog.test.ts`
- Create: `src/lib/analytics/providers/ga4.ts`
- Create: `src/lib/analytics/providers/ga4.test.ts`
- Create: `src/lib/analytics/providers/meta.ts`
- Create: `src/lib/analytics/providers/meta.test.ts`

- [ ] **Step 1: Write PostHog provider tests**

```ts
// src/lib/analytics/providers/posthog.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock posthog-js before importing provider
const mockPosthog = {
  init: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  set_config: vi.fn(),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
}
vi.mock('posthog-js', () => ({ default: mockPosthog }))

import { initPostHog, trackPostHog, upgradePostHog, downgradePostHog } from './posthog'

describe('posthog provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '')
  })

  it('no-ops when key is missing', () => {
    initPostHog()
    expect(mockPosthog.init).not.toHaveBeenCalled()
  })

  it('initializes with cookieless config when key is set', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test123')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '/phog/ingest')
    initPostHog()
    expect(mockPosthog.init).toHaveBeenCalledWith('phc_test123', expect.objectContaining({
      api_host: '/phog/ingest',
      persistence: 'memory',
      autocapture: true,
      capture_pageview: false,
      disable_session_recording: true,
    }))
  })

  it('trackPostHog calls posthog.capture', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test123')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '/phog/ingest')
    initPostHog()
    trackPostHog('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8' })
    expect(mockPosthog.capture).toHaveBeenCalledWith('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8' })
  })

  it('trackPostHog no-ops when not initialized', () => {
    trackPostHog('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8' })
    expect(mockPosthog.capture).not.toHaveBeenCalled()
  })

  it('upgradePostHog enables full tracking', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test123')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '/phog/ingest')
    initPostHog()
    upgradePostHog()
    expect(mockPosthog.opt_in_capturing).toHaveBeenCalled()
    expect(mockPosthog.set_config).toHaveBeenCalledWith({ persistence: 'localStorage+cookie' })
    expect(mockPosthog.startSessionRecording).toHaveBeenCalled()
  })

  it('downgradePostHog disables tracking', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test123')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '/phog/ingest')
    initPostHog()
    downgradePostHog()
    expect(mockPosthog.opt_out_capturing).toHaveBeenCalled()
    expect(mockPosthog.stopSessionRecording).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Create PostHog provider**

```ts
// src/lib/analytics/providers/posthog.ts
import posthog from 'posthog-js'

let initialized = false

export function initPostHog(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return

  posthog.init(key, {
    api_host: host,
    persistence: 'memory',
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: true,
    mask_all_element_attributes: false,
    session_recording: {
      maskAllInputs: false,
    },
  })
  initialized = true
}

export function trackPostHog(eventName: string, properties: Record<string, unknown>): void {
  if (!initialized) return
  posthog.capture(eventName, properties)
}

export function upgradePostHog(): void {
  if (!initialized) return
  posthog.opt_in_capturing()
  posthog.set_config({ persistence: 'localStorage+cookie' })
  posthog.startSessionRecording()
}

export function downgradePostHog(): void {
  if (!initialized) return
  posthog.opt_out_capturing()
  posthog.stopSessionRecording()
}

/** Used by useToolSession to send via sendBeacon on page exit */
export function getPostHogInstance() {
  return initialized ? posthog : null
}
```

- [ ] **Step 3: Run PostHog tests**

```bash
npx vitest run src/lib/analytics/providers/posthog.test.ts
```
Expected: PASS

- [ ] **Step 4: Write GA4 provider tests**

```ts
// src/lib/analytics/providers/ga4.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackGA4, updateGA4Consent } from './ga4'

describe('ga4 provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete (window as Record<string, unknown>).gtag
  })

  it('no-ops when gtag is not defined', () => {
    // Should not throw
    trackGA4('tool_interaction', { param_name: 'aperture' })
  })

  it('calls gtag event with correct params', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    trackGA4('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8' })
    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_interaction', {
      param_name: 'aperture',
      param_value: 'f/2.8',
    })
  })

  it('truncates property values longer than 100 chars', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    const longValue = 'a'.repeat(150)
    trackGA4('tool_interaction', { param_name: longValue })
    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_interaction', {
      param_name: longValue.slice(0, 100),
    })
  })

  it('updateGA4Consent calls gtag consent update', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    updateGA4Consent('analytics', true)
    expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
    })
  })

  it('updateGA4Consent updates marketing fields', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    updateGA4Consent('marketing', true)
    expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})
```

- [ ] **Step 5: Create GA4 provider**

```ts
// src/lib/analytics/providers/ga4.ts

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GA4_VALUE_LIMIT = 100

function truncateValues(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && value.length > GA4_VALUE_LIMIT) {
      result[key] = value.slice(0, GA4_VALUE_LIMIT)
    } else {
      result[key] = value
    }
  }
  return result
}

export function trackGA4(eventName: string, properties: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, truncateValues(properties))
}

export function updateGA4Consent(category: 'analytics' | 'marketing', granted: boolean): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  const value = granted ? 'granted' : 'denied'

  if (category === 'analytics') {
    window.gtag('consent', 'update', { analytics_storage: value })
  } else {
    window.gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    })
  }
}

export function trackGA4PageView(pagePath: string, pageTitle: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: pagePath, page_title: pageTitle })
}
```

- [ ] **Step 6: Run GA4 tests**

```bash
npx vitest run src/lib/analytics/providers/ga4.test.ts
```
Expected: PASS

- [ ] **Step 7: Write Meta provider tests**

```ts
// src/lib/analytics/providers/meta.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initMeta, trackMeta, trackMetaCustom, setMetaEnabled, isMetaReady } from './meta'

describe('meta provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete (window as Record<string, unknown>).fbq
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '')
  })

  it('no-ops when pixel ID is missing', () => {
    initMeta()
    expect(isMetaReady()).toBe(false)
  })

  it('initializes when pixel ID is set and fbq exists', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    expect(mockFbq).toHaveBeenCalledWith('init', '123456')
    expect(isMetaReady()).toBe(true)
  })

  it('trackMeta calls fbq track', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    trackMeta('ViewContent', { content_name: 'fov-simulator' })
    expect(mockFbq).toHaveBeenCalledWith('track', 'ViewContent', { content_name: 'fov-simulator' })
  })

  it('trackMetaCustom calls fbq trackCustom', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    trackMetaCustom('ToolEngaged', { tool_slug: 'fov-simulator' })
    expect(mockFbq).toHaveBeenCalledWith('trackCustom', 'ToolEngaged', { tool_slug: 'fov-simulator' })
  })

  it('stops tracking after setMetaEnabled(false)', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    mockFbq.mockClear()
    setMetaEnabled(false)
    trackMeta('PageView', {})
    expect(mockFbq).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 8: Create Meta provider**

```ts
// src/lib/analytics/providers/meta.ts

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

let ready = false
let enabled = true

export function initMeta(): void {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId) return
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

  window.fbq('init', pixelId)
  ready = true
  enabled = true
}

export function trackMeta(eventName: string, properties: Record<string, unknown>): void {
  if (!ready || !enabled) return
  if (typeof window.fbq !== 'function') return
  window.fbq('track', eventName, properties)
}

export function trackMetaCustom(eventName: string, properties: Record<string, unknown>): void {
  if (!ready || !enabled) return
  if (typeof window.fbq !== 'function') return
  window.fbq('trackCustom', eventName, properties)
}

export function setMetaEnabled(value: boolean): void {
  enabled = value
}

export function isMetaReady(): boolean {
  return ready
}

/** Returns the Meta Pixel ID for script loading, or null if not configured */
export function getMetaPixelId(): string | null {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || null
}
```

- [ ] **Step 9: Run Meta tests**

```bash
npx vitest run src/lib/analytics/providers/meta.test.ts
```
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/lib/analytics/providers/
git commit -m "feat(analytics): add PostHog, GA4, and Meta Pixel providers"
```

---

## Task 4: Create error tracking module

**Files:**
- Create: `src/lib/analytics/error-tracking.ts`
- Create: `src/lib/analytics/error-tracking.test.ts`

- [ ] **Step 1: Write error tracking tests**

```ts
// src/lib/analytics/error-tracking.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupGlobalErrorHandlers, trackJsError, trackWebGLError, trackCapabilityCheck } from './error-tracking'

describe('error-tracking', () => {
  let dispatchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    dispatchSpy = vi.fn()
    vi.restoreAllMocks()
  })

  it('trackJsError creates correct event shape', () => {
    const event = trackJsError({ message: 'test error', source: 'app.js', line: 10, column: 5 })
    expect(event).toEqual({
      name: 'js_error',
      properties: { message: 'test error', source: 'app.js', line: 10, column: 5 },
    })
  })

  it('trackWebGLError creates correct event shape', () => {
    const event = trackWebGLError({ error_type: 'context_lost' })
    expect(event).toEqual({
      name: 'webgl_error',
      properties: { error_type: 'context_lost' },
    })
  })

  it('trackCapabilityCheck creates correct event shape', () => {
    const event = trackCapabilityCheck({ feature: 'webgl2', supported: false })
    expect(event).toEqual({
      name: 'capability_check',
      properties: { feature: 'webgl2', supported: false },
    })
  })

  it('filters analytics network errors', () => {
    const shouldTrack = !isAnalyticsError('https://eu.i.posthog.com/e')
    expect(shouldTrack).toBe(false)
  })

  it('filters posthog path errors', () => {
    const shouldTrack = !isAnalyticsError('/phog/ingest/e')
    expect(shouldTrack).toBe(false)
  })

  it('allows non-analytics errors', () => {
    const shouldTrack = !isAnalyticsError('https://www.phototools.io/api/contact')
    expect(shouldTrack).toBe(true)
  })
})

// Import after defining tests so the module is available
import { isAnalyticsError } from './error-tracking'
```

- [ ] **Step 2: Create error-tracking.ts**

```ts
// src/lib/analytics/error-tracking.ts
import type { JsErrorEvent, WebGLErrorEvent, CapabilityCheckEvent } from './types'

const ANALYTICS_PATTERNS = ['/phog/', 'posthog', 'facebook', 'fbq', 'googletagmanager', 'google-analytics']

/** Check if an error source is from an analytics domain/path */
export function isAnalyticsError(source: string): boolean {
  const lower = source.toLowerCase()
  return ANALYTICS_PATTERNS.some((pattern) => lower.includes(pattern))
}

let isTrackingError = false

/**
 * Setup global error handlers. Call once from AnalyticsProvider.
 * Accepts a dispatch function to send events through the analytics pipeline.
 */
export function setupGlobalErrorHandlers(
  dispatch: (name: string, properties: Record<string, unknown>) => void,
): () => void {
  function handleError(event: ErrorEvent) {
    if (isTrackingError) return
    const source = event.filename || ''
    if (isAnalyticsError(source)) return

    isTrackingError = true
    try {
      dispatch('js_error', {
        message: event.message || 'Unknown error',
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    } finally {
      isTrackingError = false
    }
  }

  function handleRejection(event: PromiseRejectionEvent) {
    if (isTrackingError) return
    const message = event.reason?.message || event.reason?.toString() || 'Unhandled rejection'
    const source = event.reason?.stack?.split('\n')[1] || ''
    if (isAnalyticsError(source)) return

    isTrackingError = true
    try {
      dispatch('js_error', { message, source })
    } finally {
      isTrackingError = false
    }
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)

  return () => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleRejection)
  }
}

// Helper functions for component-level error tracking — return event shapes
// so they can be dispatched through the main analytics pipeline

export function trackJsError(props: JsErrorEvent) {
  return { name: 'js_error' as const, properties: props }
}

export function trackWebGLError(props: WebGLErrorEvent) {
  return { name: 'webgl_error' as const, properties: props }
}

export function trackCapabilityCheck(props: CapabilityCheckEvent) {
  return { name: 'capability_check' as const, properties: props }
}
```

- [ ] **Step 3: Run error tracking tests**

```bash
npx vitest run src/lib/analytics/error-tracking.test.ts
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics/error-tracking.ts src/lib/analytics/error-tracking.test.ts
git commit -m "feat(analytics): add error tracking module with recursion guard"
```

---

## Task 5: Create analytics dispatcher (index.ts)

This is the public API. Components import from `@/lib/analytics` and get typed tracking functions. The dispatcher enriches events with global properties and fans out to providers.

**Files:**
- Create: `src/lib/analytics/index.ts`
- Create: `src/lib/analytics/index.test.ts`

- [ ] **Step 1: Write dispatcher tests**

```ts
// src/lib/analytics/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock providers
vi.mock('./providers/posthog', () => ({
  initPostHog: vi.fn(),
  trackPostHog: vi.fn(),
  upgradePostHog: vi.fn(),
  downgradePostHog: vi.fn(),
}))
vi.mock('./providers/ga4', () => ({
  trackGA4: vi.fn(),
  updateGA4Consent: vi.fn(),
  trackGA4PageView: vi.fn(),
}))
vi.mock('./providers/meta', () => ({
  initMeta: vi.fn(),
  trackMeta: vi.fn(),
  trackMetaCustom: vi.fn(),
  setMetaEnabled: vi.fn(),
  isMetaReady: vi.fn(() => false),
  getMetaPixelId: vi.fn(() => null),
}))

import { trackPostHog } from './providers/posthog'
import { trackGA4 } from './providers/ga4'
import {
  dispatch,
  setGlobalProperties,
  trackToolInteraction,
  trackShareClick,
  trackThemeToggle,
  trackLearnPanelOpen,
  trackChallengeComplete,
} from './index'

describe('analytics dispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setGlobalProperties({
      locale: 'en',
      page_path: '/en/fov-simulator',
      viewport_type: 'desktop',
      tool_slug: 'fov-simulator',
      tool_category: 'visualizer',
    })
  })

  it('dispatch enriches events with global properties', () => {
    dispatch('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8', input_type: 'select' })
    expect(trackPostHog).toHaveBeenCalledWith('tool_interaction', expect.objectContaining({
      param_name: 'aperture',
      locale: 'en',
      page_path: '/en/fov-simulator',
      tool_slug: 'fov-simulator',
    }))
  })

  it('dispatch sends to PostHog and GA4 by default', () => {
    dispatch('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8', input_type: 'select' })
    expect(trackPostHog).toHaveBeenCalled()
    expect(trackGA4).toHaveBeenCalled()
  })

  it('POSTHOG_ONLY_EVENTS skip GA4', () => {
    dispatch('theme_toggle', { new_theme: 'dark' })
    expect(trackPostHog).toHaveBeenCalled()
    expect(trackGA4).not.toHaveBeenCalled()
  })

  it('trackToolInteraction calls dispatch with correct event', () => {
    trackToolInteraction({ param_name: 'aperture', param_value: 'f/2.8', input_type: 'select' })
    expect(trackPostHog).toHaveBeenCalledWith('tool_interaction', expect.objectContaining({
      param_name: 'aperture',
    }))
  })

  it('trackLearnPanelOpen preserves backward compatibility', () => {
    trackLearnPanelOpen({})
    expect(trackPostHog).toHaveBeenCalledWith('learn_panel_open', expect.objectContaining({
      locale: 'en',
    }))
  })

  it('trackChallengeComplete preserves backward compatibility', () => {
    trackChallengeComplete({
      challenge_id: 'c1', difficulty: 'easy', correct: true, attempt_number: 1,
    })
    expect(trackPostHog).toHaveBeenCalledWith('challenge_complete', expect.objectContaining({
      challenge_id: 'c1',
    }))
  })
})
```

- [ ] **Step 2: Create index.ts**

```ts
// src/lib/analytics/index.ts
import { trackPostHog } from './providers/posthog'
import { trackGA4 } from './providers/ga4'
import { trackMeta, trackMetaCustom, isMetaReady } from './providers/meta'
import { debugLog } from './debug'
import {
  META_EVENT_MAP,
  POSTHOG_ONLY_EVENTS,
  type GlobalProperties,
  type ToolInteractionEvent,
  type ToolEngagedEvent,
  type ToolSessionSummaryEvent,
  type ScrollDepthEvent,
  type LearnPanelSectionViewEvent,
  type ChallengeStartEvent,
  type ChallengeCompleteEvent,
  type NavClickEvent,
  type ShareClickEvent,
  type LanguageSwitchEvent,
  type ThemeToggleEvent,
  type OutboundClickEvent,
  type MobileMenuToggleEvent,
  type MobileControlsToggleEvent,
  type GlossarySearchEvent,
  type GlossaryEntryViewEvent,
  type FileUploadEvent,
  type FileUploadErrorEvent,
  type JsErrorEvent,
  type WebGLErrorEvent,
  type CapabilityCheckEvent,
  type AdSlotVisibleEvent,
  type MobileAdDismissEvent,
  type PageViewEvent,
  type AnalyticsEvent,
} from './types'

// Re-export types for consumers
export type {
  ToolInteractionEvent,
  ChallengeCompleteEvent,
  GlobalProperties,
  AnalyticsEvent,
}

// Module-scoped global properties — updated by AnalyticsProvider
let globalProps: GlobalProperties = {
  locale: 'en',
  page_path: '/',
  viewport_type: 'desktop',
  tool_slug: null,
  tool_category: null,
}

export function setGlobalProperties(props: GlobalProperties): void {
  globalProps = props
}

export function getGlobalProperties(): GlobalProperties {
  return globalProps
}

/**
 * Core dispatcher: enriches event with global properties, fans out to providers.
 */
export function dispatch(eventName: string, properties: Record<string, unknown>): void {
  const enriched = { ...globalProps, ...properties }
  const isPostHogOnly = POSTHOG_ONLY_EVENTS.has(eventName as AnalyticsEvent['name'])
  const metaMapping = META_EVENT_MAP[eventName as AnalyticsEvent['name']]

  // Always send to PostHog (cookieless pre-consent)
  trackPostHog(eventName, enriched)

  // Send to GA4 unless PostHog-only
  if (!isPostHogOnly) {
    trackGA4(eventName, enriched)
  }

  // Send to Meta if mapped and Meta is ready (consent-gated)
  if (metaMapping && isMetaReady()) {
    const metaProps = { ...enriched }
    if (metaMapping.type === 'standard') {
      trackMeta(metaMapping.fbqName, metaProps)
    } else {
      trackMetaCustom(metaMapping.fbqName, metaProps)
    }
  }

  debugLog(eventName, enriched, {
    posthog: true,
    ga4: !isPostHogOnly,
    meta: Boolean(metaMapping && isMetaReady()),
  })
}

// --- Semantic tracking functions (public API) ---

export function trackToolInteraction(props: ToolInteractionEvent): void {
  dispatch('tool_interaction', props)
}

export function trackToolEngaged(props: ToolEngagedEvent): void {
  dispatch('tool_engaged', props)
}

export function trackToolSessionSummary(props: ToolSessionSummaryEvent): void {
  dispatch('tool_session_summary', props)
}

export function trackPageScrollDepth(props: ScrollDepthEvent): void {
  dispatch('page_scroll_depth', props)
}

export function trackLearnPanelScrollDepth(props: ScrollDepthEvent): void {
  dispatch('learn_panel_scroll_depth', props)
}

export function trackLearnPanelOpen(_props: Record<string, never> | { tool_slug?: string }): void {
  // Backward-compatible: old callers pass { tool_slug }, new callers pass {}
  dispatch('learn_panel_open', {})
}

export function trackLearnPanelSectionView(props: LearnPanelSectionViewEvent): void {
  dispatch('learn_panel_section_view', props)
}

export function trackChallengeStart(props: ChallengeStartEvent): void {
  dispatch('challenge_start', props)
}

export function trackChallengeComplete(props: ChallengeCompleteEvent | {
  tool_slug?: string; challenge_id: string; difficulty: string; correct: boolean
}): void {
  // Backward-compatible: old callers don't pass attempt_number
  const normalized = {
    challenge_id: props.challenge_id,
    difficulty: props.difficulty,
    correct: props.correct,
    attempt_number: 'attempt_number' in props ? props.attempt_number : 1,
  }
  dispatch('challenge_complete', normalized)
}

export function trackNavClick(props: NavClickEvent): void {
  dispatch('nav_click', props)
}

export function trackShareClick(props: ShareClickEvent): void {
  dispatch('share_click', props)
}

export function trackLanguageSwitch(props: LanguageSwitchEvent): void {
  dispatch('language_switch', props)
}

export function trackThemeToggle(props: ThemeToggleEvent): void {
  dispatch('theme_toggle', props)
}

export function trackOutboundClick(props: OutboundClickEvent): void {
  dispatch('outbound_click', props)
}

export function trackMobileMenuToggle(props: MobileMenuToggleEvent): void {
  dispatch('mobile_menu_toggle', props)
}

export function trackMobileControlsToggle(props: MobileControlsToggleEvent): void {
  dispatch('mobile_controls_toggle', props)
}

export function trackGlossarySearch(props: GlossarySearchEvent): void {
  dispatch('glossary_search', props)
}

export function trackGlossaryEntryView(props: GlossaryEntryViewEvent): void {
  dispatch('glossary_entry_view', props)
}

export function trackContactFormSubmit(): void {
  dispatch('contact_form_submit', {})
}

export function trackFileUpload(props: FileUploadEvent): void {
  dispatch('file_upload', props)
}

export function trackFileUploadError(props: FileUploadErrorEvent): void {
  dispatch('file_upload_error', props)
}

export function trackJsError(props: JsErrorEvent): void {
  dispatch('js_error', props)
}

export function trackWebGLError(props: WebGLErrorEvent): void {
  dispatch('webgl_error', props)
}

export function trackCapabilityCheck(props: CapabilityCheckEvent): void {
  dispatch('capability_check', props)
}

export function trackAdSlotVisible(props: AdSlotVisibleEvent): void {
  dispatch('ad_slot_visible', props)
}

export function trackMobileAdDismiss(props: MobileAdDismissEvent): void {
  dispatch('mobile_ad_dismiss', props)
}

export function trackPageView(props: PageViewEvent): void {
  dispatch('page_view', props)
}
```

- [ ] **Step 3: Run dispatcher tests**

```bash
npx vitest run src/lib/analytics/index.test.ts
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics/index.ts src/lib/analytics/index.test.ts
git commit -m "feat(analytics): add analytics dispatcher with semantic tracking functions"
```

---

## Task 6: Create AnalyticsErrorBoundary and AnalyticsProvider

**Files:**
- Create: `src/lib/analytics/components/AnalyticsErrorBoundary.tsx`
- Create: `src/lib/analytics/components/AnalyticsProvider.tsx`

- [ ] **Step 1: Create AnalyticsErrorBoundary**

```tsx
// src/lib/analytics/components/AnalyticsErrorBoundary.tsx
'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { trackJsError } from '../index'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class AnalyticsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    trackJsError({
      message: error.message,
      source: errorInfo.componentStack?.split('\n')[1]?.trim(),
    })
  }

  render() {
    if (this.state.hasError) {
      // Let the app continue rendering — don't show a fallback for analytics errors
      return this.props.children
    }
    return this.props.children
  }
}
```

- [ ] **Step 2: Create AnalyticsProvider**

This is the most complex component. It initializes all SDKs, manages consent, tracks SPA pageviews, and maintains global properties.

```tsx
// src/lib/analytics/components/AnalyticsProvider.tsx
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from '@/lib/i18n/navigation'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { getToolBySlug } from '@/lib/data/tools'
import { initPostHog, upgradePostHog, downgradePostHog } from '../providers/posthog'
import { updateGA4Consent, trackGA4PageView } from '../providers/ga4'
import { initMeta, setMetaEnabled, getMetaPixelId } from '../providers/meta'
import { getConsentState, onConsentChange, getDevConsentOverride } from '../consent'
import { setupGlobalErrorHandlers } from '../error-tracking'
import { setGlobalProperties, dispatch, trackPageView } from '../index'
import type { ConsentState } from '../consent'
import type { GlobalProperties, ViewportType } from '../types'
import { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'

function getViewportType(): ViewportType {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

function extractToolSlug(pagePath: string): string | null {
  // Path format: /locale/slug or /slug
  const segments = pagePath.split('/').filter(Boolean)
  // The first segment is the tool slug (pathname from next-intl strips locale)
  const slug = segments[0] || null
  if (!slug) return null
  // Validate against tool registry
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
  const prevPathnameRef = useRef(pathname)

  // Guard: skip analytics in headless/automated environments
  useEffect(() => {
    if (!navigator.webdriver) {
      setEnabled(true)
    }
  }, [])

  // Initialize SDKs (once)
  useEffect(() => {
    if (!enabled || initializedRef.current) return
    initializedRef.current = true

    // Init PostHog (cookieless mode)
    initPostHog()

    // Setup global error handlers
    const cleanupErrors = setupGlobalErrorHandlers(dispatch)

    // Check for dev-mode consent override
    const devOverride = getDevConsentOverride()
    if (devOverride) {
      handleConsentChange(devOverride)
    } else {
      // Check existing CookieYes consent (returning users)
      const existing = getConsentState()
      if (existing.analytics || existing.marketing) {
        handleConsentChange(existing)
      }
    }

    // Listen for future consent changes
    const cleanupConsent = onConsentChange(handleConsentChange)

    // Dev-mode console utilities
    if (process.env.NODE_ENV !== 'production') {
      (window as Record<string, unknown>).__analytics = {
        grantConsent: (category: string) => {
          handleConsentChange({
            analytics: category === 'analytics' ? true : analyticsConsent,
            marketing: category === 'marketing' ? true : marketingConsent,
          })
        },
        revokeConsent: (category: string) => {
          handleConsentChange({
            analytics: category === 'analytics' ? false : analyticsConsent,
            marketing: category === 'marketing' ? false : marketingConsent,
          })
        },
        getState: () => ({ analytics: analyticsConsent, marketing: marketingConsent }),
      }
    }

    return () => {
      cleanupErrors()
      cleanupConsent()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Handle consent state changes (grant + revoke)
  function handleConsentChange(state: ConsentState) {
    // Analytics consent
    if (state.analytics && !analyticsConsent) {
      upgradePostHog()
      updateGA4Consent('analytics', true)
      setAnalyticsConsent(true)
    } else if (!state.analytics && analyticsConsent) {
      downgradePostHog()
      updateGA4Consent('analytics', false)
      setAnalyticsConsent(false)
    }

    // Marketing consent
    if (state.marketing && !marketingConsent) {
      updateGA4Consent('marketing', true)
      setMarketingConsent(true)
      // Meta Pixel init happens after the script loads (onLoad callback)
    } else if (!state.marketing && marketingConsent) {
      setMetaEnabled(false)
      updateGA4Consent('marketing', false)
      setMarketingConsent(false)
    }
  }

  // Update global properties on route change
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
  }, [locale, pathname, enabled])

  // Track SPA pageviews on route change
  useEffect(() => {
    if (!enabled) return
    if (prevPathnameRef.current === pathname) return
    prevPathnameRef.current = pathname

    const fullPath = `/${locale}${pathname}`
    const title = document.title
    trackPageView({ page_path: fullPath, page_title: title })
    trackGA4PageView(fullPath, title)
  }, [pathname, locale, enabled])

  // Fire Meta ViewContent on tool pages
  useEffect(() => {
    if (!enabled || !marketingConsent) return
    const toolSlug = extractToolSlug(pathname)
    if (!toolSlug) return
    const tool = getToolBySlug(toolSlug)
    if (!tool) return
    // Import is safe here — Meta provider handles readiness check
    import('../providers/meta').then(({ trackMeta }) => {
      trackMeta('ViewContent', { content_name: toolSlug, content_category: tool.category })
    })
  }, [pathname, enabled, marketingConsent])

  if (!enabled) return <>{children}</>

  const metaPixelId = getMetaPixelId()

  return (
    <AnalyticsErrorBoundary>
      {children}
      <SpeedInsights />
      <Analytics />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-B0QND42GRG"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('js',new Date());gtag('config','G-B0QND42GRG');`}
      </Script>
      {marketingConsent && metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          onLoad={() => initMeta()}
        >
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`}
        </Script>
      )}
    </AnalyticsErrorBoundary>
  )
}
```

- [ ] **Step 3: Run all analytics tests to verify nothing broke**

```bash
npx vitest run src/lib/analytics/
```
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics/components/
git commit -m "feat(analytics): add AnalyticsProvider and AnalyticsErrorBoundary"
```

---

## Task 7: Create analytics hooks

**Files:**
- Create: `src/lib/analytics/hooks/useDebouncedTracker.ts`
- Create: `src/lib/analytics/hooks/useDebouncedTracker.test.ts`
- Create: `src/lib/analytics/hooks/useScrollDepth.ts`
- Create: `src/lib/analytics/hooks/useScrollDepth.test.ts`
- Create: `src/lib/analytics/hooks/useToolSession.ts`
- Create: `src/lib/analytics/hooks/useToolSession.test.ts`

- [ ] **Step 1: Write useDebouncedTracker tests**

```ts
// src/lib/analytics/hooks/useDebouncedTracker.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedTracker } from './useDebouncedTracker'

vi.mock('../index', () => ({
  trackToolInteraction: vi.fn(),
}))

import { trackToolInteraction } from '../index'

describe('useDebouncedTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces slider changes at 500ms', () => {
    const { result } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'focal_length', param_value: '24', input_type: 'slider' })
      result.current({ param_name: 'focal_length', param_value: '35', input_type: 'slider' })
      result.current({ param_name: 'focal_length', param_value: '50', input_type: 'slider' })
    })
    expect(trackToolInteraction).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(500) })
    expect(trackToolInteraction).toHaveBeenCalledTimes(1)
    expect(trackToolInteraction).toHaveBeenCalledWith(expect.objectContaining({ param_value: '50' }))
  })

  it('fires immediately for non-slider input types', () => {
    const { result } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'sensor', param_value: 'full-frame', input_type: 'select' })
    })
    expect(trackToolInteraction).toHaveBeenCalledTimes(1)
  })

  it('flushes pending events on unmount', () => {
    const { result, unmount } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'focal_length', param_value: '85', input_type: 'slider' })
    })
    expect(trackToolInteraction).not.toHaveBeenCalled()
    unmount()
    expect(trackToolInteraction).toHaveBeenCalledWith(expect.objectContaining({ param_value: '85' }))
  })
})
```

- [ ] **Step 2: Create useDebouncedTracker**

```ts
// src/lib/analytics/hooks/useDebouncedTracker.ts
import { useRef, useEffect, useCallback } from 'react'
import { trackToolInteraction } from '../index'
import type { ToolInteractionEvent } from '../types'

const DEBOUNCE_MS = 500
const DEBOUNCED_TYPES = new Set(['slider'])

export function useDebouncedTracker() {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pendingRef = useRef<Map<string, ToolInteractionEvent>>(new Map())

  // Flush all pending events (used on unmount)
  const flush = useCallback(() => {
    for (const [, timer] of timersRef.current) clearTimeout(timer)
    timersRef.current.clear()
    for (const [, event] of pendingRef.current) trackToolInteraction(event)
    pendingRef.current.clear()
  }, [])

  // Cleanup on unmount — flush pending events
  useEffect(() => flush, [flush])

  return useCallback((event: ToolInteractionEvent) => {
    if (!DEBOUNCED_TYPES.has(event.input_type)) {
      // Immediate fire for discrete controls
      trackToolInteraction(event)
      return
    }

    // Debounce per param_name
    const key = event.param_name
    const existing = timersRef.current.get(key)
    if (existing) clearTimeout(existing)

    pendingRef.current.set(key, event)
    timersRef.current.set(key, setTimeout(() => {
      const pending = pendingRef.current.get(key)
      if (pending) trackToolInteraction(pending)
      pendingRef.current.delete(key)
      timersRef.current.delete(key)
    }, DEBOUNCE_MS))
  }, [])
}
```

- [ ] **Step 3: Run useDebouncedTracker tests**

```bash
npx vitest run src/lib/analytics/hooks/useDebouncedTracker.test.ts
```
Expected: PASS

- [ ] **Step 4: Write useScrollDepth tests**

```ts
// src/lib/analytics/hooks/useScrollDepth.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollDepth } from './useScrollDepth'

vi.mock('../index', () => ({
  dispatch: vi.fn(),
}))

import { dispatch } from '../index'

describe('useScrollDepth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a ref callback', () => {
    const { result } = renderHook(() => useScrollDepth({ event: 'learn_panel_scroll_depth' }))
    expect(typeof result.current).toBe('function')
  })

  it('fires threshold events once', () => {
    const div = document.createElement('div')
    Object.defineProperties(div, {
      scrollHeight: { get: () => 1000, configurable: true },
      clientHeight: { get: () => 200, configurable: true },
      scrollTop: { get: () => 200, configurable: true, set: () => {} },
    })

    const { result } = renderHook(() => useScrollDepth({ event: 'learn_panel_scroll_depth' }))

    // Attach ref
    result.current(div)

    // Simulate scroll event
    div.dispatchEvent(new Event('scroll'))

    // 200 / (1000 - 200) = 25% — should fire 25 threshold
    expect(dispatch).toHaveBeenCalledWith('learn_panel_scroll_depth', expect.objectContaining({
      depth_percent: 25,
    }))
  })
})
```

- [ ] **Step 5: Create useScrollDepth**

```ts
// src/lib/analytics/hooks/useScrollDepth.ts
import { useRef, useCallback, useEffect } from 'react'
import { dispatch } from '../index'

const THRESHOLDS = [25, 50, 75, 100] as const

type ScrollDepthOptions = {
  event: 'page_scroll_depth' | 'learn_panel_scroll_depth'
}

export function useScrollDepth({ event }: ScrollDepthOptions) {
  const firedRef = useRef<Set<number>>(new Set())
  const elementRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const checkScroll = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    const scrollable = el.scrollHeight - el.clientHeight
    if (scrollable <= 0) return

    const percent = (el.scrollTop / scrollable) * 100

    for (const threshold of THRESHOLDS) {
      if (percent >= threshold && !firedRef.current.has(threshold)) {
        firedRef.current.add(threshold)
        dispatch(event, { depth_percent: threshold })
      }
    }
  }, [event])

  const handleScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      checkScroll()
      rafRef.current = null
    })
  }, [checkScroll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Ref callback — attaches/detaches scroll listener
  const setRef = useCallback((node: HTMLElement | null) => {
    // Detach from old element
    if (elementRef.current) {
      elementRef.current.removeEventListener('scroll', handleScroll)
    }

    elementRef.current = node
    firedRef.current.clear()

    // Attach to new element
    if (node) {
      node.addEventListener('scroll', handleScroll, { passive: true })
    }
  }, [handleScroll])

  return setRef
}
```

- [ ] **Step 6: Run useScrollDepth tests**

```bash
npx vitest run src/lib/analytics/hooks/useScrollDepth.test.ts
```
Expected: PASS

- [ ] **Step 7: Write useToolSession tests**

```ts
// src/lib/analytics/hooks/useToolSession.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToolSession } from './useToolSession'

vi.mock('../index', () => ({
  trackToolInteraction: vi.fn(),
  dispatch: vi.fn(),
}))

import { dispatch } from '../index'

describe('useToolSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires tool_engaged at 30 seconds', () => {
    renderHook(() => useToolSession())
    act(() => { vi.advanceTimersByTime(30_000) })
    expect(dispatch).toHaveBeenCalledWith('tool_engaged', expect.objectContaining({
      duration_seconds: 30,
    }))
  })

  it('fires tool_session_summary on unmount', () => {
    const { unmount } = renderHook(() => useToolSession())
    act(() => { vi.advanceTimersByTime(10_000) })
    unmount()
    expect(dispatch).toHaveBeenCalledWith('tool_session_summary', expect.objectContaining({
      duration_seconds: expect.any(Number),
      interaction_count: 0,
    }))
  })

  it('trackParam increments interaction count', () => {
    const { result, unmount } = renderHook(() => useToolSession())
    act(() => {
      result.current.trackParam({ param_name: 'aperture', param_value: 'f/2.8', input_type: 'select' })
      result.current.trackParam({ param_name: 'iso', param_value: '100', input_type: 'select' })
    })
    unmount()
    expect(dispatch).toHaveBeenCalledWith('tool_session_summary', expect.objectContaining({
      interaction_count: 2,
    }))
  })
})
```

- [ ] **Step 8: Create useToolSession**

```ts
// src/lib/analytics/hooks/useToolSession.ts
import { useRef, useEffect, useCallback } from 'react'
import { trackToolInteraction, dispatch } from '../index'
import { useDebouncedTracker } from './useDebouncedTracker'
import type { ToolInteractionEvent } from '../types'

const ENGAGED_THRESHOLD_MS = 30_000

export function useToolSession() {
  const startTimeRef = useRef(Date.now())
  const interactionCountRef = useRef(0)
  const engagedFiredRef = useRef(false)
  const paramsRef = useRef<Record<string, string>>({})
  const debouncedTrack = useDebouncedTracker()

  // Track param change: debounces sliders, fires immediate for discrete, counts interactions
  const trackParam = useCallback((event: ToolInteractionEvent) => {
    interactionCountRef.current++
    paramsRef.current[event.param_name] = event.param_value
    debouncedTrack(event)
  }, [debouncedTrack])

  // Fire tool_engaged at 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (engagedFiredRef.current) return
      engagedFiredRef.current = true
      dispatch('tool_engaged', {
        duration_seconds: 30,
      })
    }, ENGAGED_THRESHOLD_MS)

    return () => clearTimeout(timer)
  }, [])

  // Fire tool_session_summary on unmount + beforeunload
  useEffect(() => {
    function sendSummary() {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      dispatch('tool_session_summary', {
        duration_seconds: duration,
        interaction_count: interactionCountRef.current,
        final_params: paramsRef.current,
        param_count: Object.keys(paramsRef.current).length,
        primary_param: Object.keys(paramsRef.current).pop() || '',
      })
    }

    function handleBeforeUnload() {
      sendSummary()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sendSummary() // SPA navigation unmount
    }
  }, [])

  return { trackParam, paramsRef }
}
```

- [ ] **Step 9: Run all hook tests**

```bash
npx vitest run src/lib/analytics/hooks/
```
Expected: All pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/analytics/hooks/
git commit -m "feat(analytics): add useDebouncedTracker, useScrollDepth, and useToolSession hooks"
```

---

## Task 8: Update infrastructure (next.config.ts, robots.ts)

**Files:**
- Modify: `next.config.ts`
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Update next.config.ts — add CSP domains and rewrites**

In `next.config.ts`, add to the CSP string:
- `script-src`: append `https://eu-assets.i.posthog.com https://connect.facebook.net`
- `connect-src`: append `https://eu.i.posthog.com https://www.facebook.com`
- `img-src`: append `https://www.facebook.com`
- `frame-src`: append `https://www.facebook.com`

Add rewrites function:
```ts
async rewrites() {
  return [
    { source: '/phog/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    { source: '/phog/assets/:path*', destination: 'https://eu-assets.i.posthog.com/:path*' },
  ]
},
```

Exact changes to the existing CSP in `next.config.ts:39`:
```
script-src 'self' 'unsafe-inline'${...} https://www.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://va.vercel-scripts.com https://eu-assets.i.posthog.com https://connect.facebook.net
```

```
connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://cdn-cookieyes.com https://log.cookieyes.com https://eu.i.posthog.com https://www.facebook.com
```

```
img-src 'self' blob: data: https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net https://cdn-cookieyes.com https://www.facebook.com
```

```
frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://www.facebook.com
```

- [ ] **Step 2: Update robots.ts**

Add `disallow: '/phog/'` to the robots rules:

```ts
// src/app/robots.ts
import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/phog/',
    },
    sitemap: 'https://www.phototools.io/sitemap.xml',
  }
}
```

- [ ] **Step 3: Verify build still works**

```bash
npm run lint
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts src/app/robots.ts
git commit -m "feat(analytics): add PostHog/Meta CSP domains, /phog/ reverse proxy, robots.txt"
```

---

## Task 9: Integrate AnalyticsProvider into layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Delete: `src/lib/analytics.ts` (old module)
- Delete: `src/components/layout/AnalyticsScripts.tsx` (replaced by AnalyticsProvider)

- [ ] **Step 1: Update layout.tsx**

Replace the `AnalyticsScripts` import and usage with `AnalyticsProvider`:

1. Remove: `import { AnalyticsScripts } from '@/components/layout/AnalyticsScripts'`
2. Add: `import { AnalyticsProvider } from '@/lib/analytics/components/AnalyticsProvider'`
3. Replace `<AnalyticsScripts />` at line 140 with wrapping `AnalyticsProvider` around the content inside `NextIntlClientProvider`.

The render should become:
```tsx
<NextIntlClientProvider messages={messages}>
  <AnalyticsProvider>
    <JsonLd />
    <ThemeProvider>
      <ViewTransition>
        <div id="main-content" ...>
          {children}
        </div>
      </ViewTransition>
    </ThemeProvider>
  </AnalyticsProvider>
</NextIntlClientProvider>
```

Remove the `<AnalyticsScripts />` at line 140 — its functionality is now inside `AnalyticsProvider`.

- [ ] **Step 2: Delete old files**

```bash
rm src/lib/analytics.ts
rm src/components/layout/AnalyticsScripts.tsx
```

- [ ] **Step 3: Update existing imports**

`LearnPanel.tsx` line 6: change `import { trackLearnPanelOpen } from '@/lib/analytics'` — this now resolves to `@/lib/analytics/index.ts` (no change needed since the barrel export preserves the function signature).

`ChallengeCard.tsx` line 6: same — `import { trackChallengeComplete } from '@/lib/analytics'` resolves to the new module.

Verify both still resolve correctly — the function signatures are backward-compatible.

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```
Expected: All existing tests pass. The new analytics module handles backward-compatible imports.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/layout.tsx
git rm src/lib/analytics.ts src/components/layout/AnalyticsScripts.tsx
git commit -m "feat(analytics): integrate AnalyticsProvider into layout, remove old analytics"
```

---

## Task 10: Instrument Nav, Footer, and Homepage

**Files:**
- Modify: `src/components/layout/Nav.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Instrument Nav**

In `Nav.tsx`:
1. Add import: `import { trackNavClick, trackMobileMenuToggle } from '@/lib/analytics'`
2. On each live tool `<Link>` (line 134-145), add data attributes and tracking:
   ```tsx
   <Link
     key={tool.slug}
     href={`/${tool.slug}`}
     className={styles.megaItem}
     data-ph-capture-attribute-source="mega-menu"
     data-ph-capture-attribute-tool-slug={tool.slug}
     onClick={(e) => {
       trackNavClick({ target: tool.slug, source: 'mega-menu' })
       if (!e.metaKey && !e.ctrlKey) setToolsOpen(false)
     }}
   >
   ```
3. On the glossary link (line 165): `onClick={() => trackNavClick({ target: 'glossary', source: 'mega-menu' })}`
4. On the tools dropdown button toggle (line 104), track mobile menu:
   ```tsx
   onClick={() => {
     const next = !toolsOpen
     setToolsOpen(next)
     trackMobileMenuToggle({ action: next ? 'open' : 'close' })
   }}
   ```

- [ ] **Step 2: Instrument Footer**

In `Footer.tsx`:
1. Add import: `import { trackNavClick } from '@/lib/analytics'`
2. On each `<Link>`, add:
   ```tsx
   <Link href="/learn/glossary" className={styles.link}
     data-ph-capture-attribute-source="footer"
     onClick={() => trackNavClick({ target: 'glossary', source: 'footer' })}>
   ```
   Repeat for about, contact, privacy, terms links.

- [ ] **Step 3: Instrument Homepage tool cards**

In `src/app/[locale]/page.tsx` (server component — data attributes only, no onClick):
Add `data-ph-capture-attribute-source="homepage-card"` and `data-ph-capture-attribute-tool-slug={tool.slug}` to each live tool `<Link>` (line 53-63):
```tsx
<Link
  href={`/${tool.slug}`}
  className={styles.card}
  data-ph-capture-attribute-source="homepage-card"
  data-ph-capture-attribute-tool-slug={tool.slug}
>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Nav.tsx src/components/layout/Footer.tsx src/app/[locale]/page.tsx
git commit -m "feat(analytics): instrument Nav, Footer, and Homepage with tracking"
```

---

## Task 11: Upgrade LearnPanel and ChallengeCard

**Files:**
- Modify: `src/components/shared/LearnPanel.tsx`
- Modify: `src/components/shared/ChallengeCard.tsx`

- [ ] **Step 1: Update LearnPanel**

1. Update import: `import { trackLearnPanelOpen, trackLearnPanelSectionView } from '@/lib/analytics'`
2. Add `import { useScrollDepth } from '@/lib/analytics/hooks/useScrollDepth'`
3. Add scroll depth ref to the panel `<aside>`:
   ```tsx
   const scrollRef = useScrollDepth({ event: 'learn_panel_scroll_depth' })
   // ...
   <aside className={styles.panel} ref={scrollRef}>
   ```
4. Add section view tracking. Use IntersectionObserver on section elements, or simply track when sections are rendered (they're always visible in the panel). Simplest: track once on mount for each visible section. Add an `useEffect` that fires `trackLearnPanelSectionView` for 'beginner' on mount, since it's always visible:
   ```tsx
   useEffect(() => {
     trackLearnPanelSectionView({ section: 'beginner' })
   }, [])
   ```

- [ ] **Step 2: Update ChallengeCard**

1. Update import: `import { trackChallengeComplete, trackChallengeStart } from '@/lib/analytics'`
2. Add `attemptRef` to track attempt number:
   ```tsx
   const attemptRef = useRef(0)
   ```
3. In the `check` callback, increment attempt and pass it:
   ```tsx
   const check = useCallback(() => {
     if (!selected) return
     attemptRef.current++
     const correct = challenge.correctOption === selected
     // ...
     trackChallengeComplete({
       challenge_id: challenge.id,
       difficulty: challenge.difficulty,
       correct,
       attempt_number: attemptRef.current,
     })
   ```
4. Add `trackChallengeStart` when user first selects an option (only fire once per challenge):
   ```tsx
   const startedRef = useRef(false)
   // In option button onClick:
   onClick={() => {
     if (!result) {
       if (!startedRef.current) {
         startedRef.current = true
         trackChallengeStart({ challenge_id: challenge.id, difficulty: challenge.difficulty })
       }
       setSelected(value)
     }
   }}
   ```
5. Reset `attemptRef` and `startedRef` in the `useEffect` that resets on challenge change.

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/shared/
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/LearnPanel.tsx src/components/shared/ChallengeCard.tsx
git commit -m "feat(analytics): add scroll depth, section view, and challenge start tracking"
```

---

## Task 12: Instrument ShareModal, LanguageSwitcher, ThemeToggle

**Files:**
- Modify: `src/components/shared/ShareModal.tsx`
- Modify: `src/components/shared/LanguageSwitcher.tsx`
- Modify: `src/components/layout/ThemeToggle.tsx`

- [ ] **Step 1: Update ShareModal**

1. Add import: `import { trackShareClick } from '@/lib/analytics'`
2. In the `copy` callback (line 34), add tracking:
   ```tsx
   const copy = useCallback((key: string, text: string) => {
     const method = key as 'copy-link' | 'embed' | 'markdown' | 'bbcode'
     trackShareClick({ method: key === 'link' ? 'copy-link' : method })
     navigator.clipboard.writeText(text).then(() => {
       // ...existing code
     })
   }, [tToast])
   ```

- [ ] **Step 2: Update LanguageSwitcher**

1. Add import: `import { trackLanguageSwitch } from '@/lib/analytics'`
2. In `switchLocale` (line 37), add tracking:
   ```tsx
   function switchLocale(newLocale: Locale) {
     trackLanguageSwitch({ from_locale: locale, to_locale: newLocale })
     router.replace(pathname, { locale: newLocale })
     setOpen(false)
   }
   ```

- [ ] **Step 3: Update ThemeToggle**

1. Add import: `import { trackThemeToggle } from '@/lib/analytics'`
2. In the button onClick, add tracking:
   ```tsx
   onClick={() => {
     const newTheme = theme === 'dark' ? 'light' : 'dark'
     trackThemeToggle({ new_theme: newTheme })
     onChange(newTheme)
   }}
   ```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ShareModal.tsx src/components/shared/LanguageSwitcher.tsx src/components/layout/ThemeToggle.tsx
git commit -m "feat(analytics): instrument ShareModal, LanguageSwitcher, and ThemeToggle"
```

---

## Task 13: Instrument FileDropZone, AdUnit, MobileAdBanner, ScenePicker

**Files:**
- Modify: `src/components/shared/FileDropZone.tsx`
- Modify: `src/components/shared/AdUnit.tsx`
- Modify: `src/components/shared/MobileAdBanner.tsx`
- Modify: `src/components/shared/ScenePicker.tsx`

- [ ] **Step 1: Update FileDropZone**

1. Add import: `import { trackFileUpload, trackFileUploadError } from '@/lib/analytics'`
2. In `handleFile` (line 19), add upload tracking:
   ```tsx
   const handleFile = useCallback((file: File) => {
     if (!file.type.startsWith('image/')) {
       trackFileUploadError({ error_type: 'invalid_type', file_type: file.type })
       return
     }
     trackFileUpload({ file_type: file.type, file_size_kb: Math.round(file.size / 1024) })
     setFileName(file.name)
     onFile(file)
   }, [onFile])
   ```
   Note: the current `handleDrop` already checks `file.type.startsWith('image/')` before calling `handleFile`, so the error tracking goes in `handleDrop` for invalid drops. Adjust the logic so `handleFile` always gets called and does its own validation, or add error tracking to the drop handler.

- [ ] **Step 2: Update AdUnit**

1. Add import: `import { trackAdSlotVisible } from '@/lib/analytics'`
2. Add IntersectionObserver for ad slot visibility. In the `useEffect` (line 28), add after the MutationObserver setup:
   ```tsx
   // Track ad slot visibility
   const visibilityObserver = new IntersectionObserver(
     ([entry]) => {
       if (entry.isIntersecting) {
         trackAdSlotVisible({ slot_id: slot, format, viewport_type: window.innerWidth < 768 ? 'mobile' : 'desktop' })
         visibilityObserver.disconnect()
       }
     },
     { threshold: 0.5 },
   )
   if (ins) visibilityObserver.observe(ins)
   ```
   And disconnect in cleanup.

- [ ] **Step 3: Update MobileAdBanner**

1. Add import: `import { trackMobileAdDismiss } from '@/lib/analytics'`
2. Add a mount timestamp ref: `const mountTimeRef = useRef(Date.now())`
3. In `handleClose` (line 33):
   ```tsx
   function handleClose() {
     trackMobileAdDismiss({
       time_before_dismiss_seconds: Math.round((Date.now() - mountTimeRef.current) / 1000),
     })
     sessionStorage.setItem(DISMISS_KEY, '1')
     setDismissed(true)
   }
   ```

- [ ] **Step 4: Update ScenePicker**

1. Add import: `import { trackToolInteraction } from '@/lib/analytics'`
2. In the scene button onClick, add tracking when a scene is selected:
   ```tsx
   onClick={() => {
     trackToolInteraction({ param_name: 'scene', param_value: `scene-${index}`, input_type: 'scene-picker' })
     onSelect(index)
   }}
   ```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/FileDropZone.tsx src/components/shared/AdUnit.tsx src/components/shared/MobileAdBanner.tsx src/components/shared/ScenePicker.tsx
git commit -m "feat(analytics): instrument FileDropZone, AdUnit, MobileAdBanner, ScenePicker"
```

---

## Task 14: Instrument Glossary and Contact form

**Files:**
- Modify: `src/app/[locale]/learn/glossary/_components/Glossary.tsx`
- Modify: `src/app/[locale]/contact/_components/ContactForm.tsx`

- [ ] **Step 1: Update Glossary**

1. Add import: `import { trackGlossarySearch, trackGlossaryEntryView } from '@/lib/analytics'`
2. Add `import { useDebouncedTracker } from '@/lib/analytics/hooks/useDebouncedTracker'` — actually, for glossary search we want a simple debounce, not the tool interaction debounce. Use a local debounce with `useRef`:
   ```tsx
   const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

   // In the onChange handler for the search input:
   onChange={(e) => {
     const value = e.target.value
     setQuery(value)
     if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
     searchTimerRef.current = setTimeout(() => {
       if (value.trim()) {
         trackGlossarySearch({ search_term: value.trim(), results_count: filtered.length })
       }
     }, 500)
   }}
   ```
   Note: `filtered` depends on `query` state which updates async. The tracking should happen after the filter runs. A simpler approach: use a `useEffect` that watches `filtered` and `query`:
   ```tsx
   const prevQueryRef = useRef('')
   useEffect(() => {
     if (query.trim() && query !== prevQueryRef.current) {
       const timer = setTimeout(() => {
         trackGlossarySearch({ search_term: query.trim(), results_count: filtered.length })
         prevQueryRef.current = query
       }, 500)
       return () => clearTimeout(timer)
     }
   }, [query, filtered.length])
   ```
3. Add entry view tracking on the term link click:
   ```tsx
   // On the "Try tool" link, also track the glossary entry view
   <Link className={styles.toolLink} href={`/${entry.relatedTool}`}
     onClick={() => trackGlossaryEntryView({ term_id: entry.id })}>
   ```

- [ ] **Step 2: Update ContactForm**

1. Add import: `import { trackContactFormSubmit } from '@/lib/analytics'`
2. Add `data-ph-no-capture` to the form element to mask PII in session replays:
   ```tsx
   <form onSubmit={handleSubmit} className={styles.form} data-ph-no-capture>
   ```
3. In `handleSubmit`, after successful submission (line 28):
   ```tsx
   if (res.ok) {
     trackContactFormSubmit()
     toast.success(t('successToast'))
     setSent(true)
     form.reset()
   }
   ```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/learn/glossary/_components/Glossary.tsx src/app/[locale]/contact/_components/ContactForm.tsx
git commit -m "feat(analytics): instrument Glossary search and Contact form"
```

---

## Task 15: Add useToolSession to tool pages

Each tool's main component needs `useToolSession`. There are 16 tools, but many share similar patterns. Show the FOV Simulator as the reference implementation, then list exact changes for each other tool.

**Files:**
- Modify: `src/app/[locale]/fov-simulator/_components/FovSimulator.tsx` (reference)
- Modify: Each tool's main component (listed below)

- [ ] **Step 1: Instrument FOV Simulator (reference implementation)**

In `FovSimulator.tsx`:
1. Add import: `import { useToolSession } from '@/lib/analytics/hooks/useToolSession'`
2. Inside the component, add the hook:
   ```tsx
   const { trackParam } = useToolSession()
   ```
3. In the `LensPanel` `onChange` handler (line 82), wrap with tracking. The `onChange` receives `updates` (partial lens config). Track the first key-value pair:
   ```tsx
   onChange={(u) => {
     const key = Object.keys(u)[0]
     if (key) trackParam({ param_name: key, param_value: String(Object.values(u)[0]), input_type: 'slider' })
     dispatch({ type: 'SET_LENS', payload: { index: i, updates: u } })
   }}
   ```
4. Track discrete controls — orientation toggle (line 59), image selection via ScenePicker (already handled by ScenePicker instrumentation in Task 13), active lens selection.

- [ ] **Step 2: Instrument remaining tools**

For each tool listed below, add `useToolSession` and wire `trackParam` into control handlers. The pattern is the same as FOV Simulator:

| Tool | Main component file |
|------|-------------------|
| color-scheme-generator | `src/app/[locale]/color-scheme-generator/_components/ColorSchemeGenerator.tsx` |
| exposure-simulator | `src/app/[locale]/exposure-simulator/_components/ExposureSimulator.tsx` |
| dof-simulator | `src/app/[locale]/dof-simulator/_components/DofSimulator.tsx` |
| hyperfocal-simulator | `src/app/[locale]/hyperfocal-simulator/_components/HyperfocalSimulator.tsx` |
| sensor-size-comparison | `src/app/[locale]/sensor-size-comparison/_components/SensorSizeComparison.tsx` |
| star-trail-calculator | `src/app/[locale]/star-trail-calculator/_components/StarTrailCalculator.tsx` |
| white-balance-visualizer | `src/app/[locale]/white-balance-visualizer/_components/WhiteBalanceVisualizer.tsx` |
| frame-studio | `src/app/[locale]/frame-studio/_components/FrameStudio.tsx` |
| exif-viewer | `src/app/[locale]/exif-viewer/_components/ExifViewer.tsx` |
| nd-filter-calculator | `src/app/[locale]/nd-filter-calculator/_components/NdFilterCalculator.tsx` |
| focus-stacking-calculator | `src/app/[locale]/focus-stacking-calculator/_components/FocusStackingCalculator.tsx` |
| equivalent-settings-calculator | `src/app/[locale]/equivalent-settings-calculator/_components/EquivalentSettingsCalculator.tsx` |
| shutter-speed-visualizer | `src/app/[locale]/shutter-speed-visualizer/_components/ShutterSpeedVisualizer.tsx` |
| perspective-compression-simulator | `src/app/[locale]/perspective-compression-simulator/_components/PerspectiveCompressionSimulator.tsx` |

For each:
1. Add `import { useToolSession } from '@/lib/analytics/hooks/useToolSession'`
2. Add `const { trackParam } = useToolSession()` inside the component
3. Wire `trackParam` into slider `onChange` handlers (input_type: 'slider')
4. Wire `trackToolInteraction` directly into select/toggle handlers (input_type: 'select' | 'toggle')

- [ ] **Step 3: Commit per batch**

Split into 2-3 commits to keep diffs manageable:
```bash
git add src/app/[locale]/fov-simulator/ src/app/[locale]/color-scheme-generator/ src/app/[locale]/exposure-simulator/ src/app/[locale]/dof-simulator/ src/app/[locale]/hyperfocal-simulator/
git commit -m "feat(analytics): add useToolSession to FOV, Color, Exposure, DoF, Hyperfocal tools"

git add src/app/[locale]/sensor-size-comparison/ src/app/[locale]/star-trail-calculator/ src/app/[locale]/white-balance-visualizer/ src/app/[locale]/frame-studio/ src/app/[locale]/exif-viewer/
git commit -m "feat(analytics): add useToolSession to Sensor, Star Trail, WB, Frame, EXIF tools"

git add src/app/[locale]/nd-filter-calculator/ src/app/[locale]/focus-stacking-calculator/ src/app/[locale]/equivalent-settings-calculator/ src/app/[locale]/shutter-speed-visualizer/ src/app/[locale]/perspective-compression-simulator/
git commit -m "feat(analytics): add useToolSession to ND, Focus, Equivalent, Shutter, Perspective tools"
```

---

## Task 16: Update E2E smoke test filters

**Files:**
- Modify: `src/e2e/smoke/all-pages.spec.ts`

- [ ] **Step 1: Find and update the benign error filter**

In `src/e2e/smoke/all-pages.spec.ts`, find the console error filter array (filters favicon 404, cookieyes, adsense, adsbygoogle, _vercel/speed-insights). Add PostHog and Meta Pixel patterns:

```ts
// Add to the benign error patterns:
'posthog',
'eu.i.posthog.com',
'eu-assets.i.posthog.com',
'/phog/',
'connect.facebook.net',
'fbevents.js',
'facebook.com',
```

- [ ] **Step 2: Run smoke tests to verify**

```bash
npm run build && npx playwright test src/e2e/smoke/
```
Expected: All pass (no new console errors from analytics scripts).

- [ ] **Step 3: Commit**

```bash
git add src/e2e/smoke/all-pages.spec.ts
git commit -m "feat(analytics): add PostHog and Meta Pixel to e2e benign error filter"
```

---

## Task 17: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass (existing + new analytics tests).

- [ ] **Step 2: Run lint**

```bash
npm run lint
```
Expected: No errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```
Expected: Clean build with no errors.

- [ ] **Step 4: Run E2E tests**

```bash
npx playwright test
```
Expected: All pass.

- [ ] **Step 5: Final commit if any fixups needed**

```bash
git add -A
git commit -m "fix(analytics): address lint/build issues from analytics integration"
```
