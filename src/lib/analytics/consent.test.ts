import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getConsentState, onConsentChange } from './consent'

describe('consent', () => {
  beforeEach(() => {
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

    const event = new CustomEvent('cookieyes_consent_update', {
      detail: { accepted: ['analytics'], rejected: ['advertisement'] },
    })
    document.dispatchEvent(event)

    expect(listener).toHaveBeenCalledTimes(1)
    cleanup()
  })
})
