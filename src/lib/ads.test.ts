import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('ads config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('isAdsEnabled returns false when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT
    delete process.env.NEXT_PUBLIC_COOKIEYES_ID
    const { isAdsEnabled } = await import('./ads')
    expect(isAdsEnabled()).toBe(false)
  })

  it('isAdsEnabled returns false when only ADSENSE_CLIENT is set', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-123'
    delete process.env.NEXT_PUBLIC_COOKIEYES_ID
    const { isAdsEnabled } = await import('./ads')
    expect(isAdsEnabled()).toBe(false)
  })

  it('isAdsEnabled returns true when both env vars are set', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-123'
    process.env.NEXT_PUBLIC_COOKIEYES_ID = 'abc123'
    const { isAdsEnabled } = await import('./ads')
    expect(isAdsEnabled()).toBe(true)
  })

  it('AD_FORMATS has correct dimensions', async () => {
    const { AD_FORMATS } = await import('./ads')
    expect(AD_FORMATS.rectangle).toEqual({ width: 300, height: 250 })
    expect(AD_FORMATS.leaderboard).toEqual({ width: 728, height: 90 })
    expect(AD_FORMATS['mobile-banner']).toEqual({ width: 320, height: 50 })
  })

  it('getAdsenseClient returns the env var value', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = 'ca-pub-999'
    const { getAdsenseClient } = await import('./ads')
    expect(getAdsenseClient()).toBe('ca-pub-999')
  })

  it('getCookieyesId returns the env var value', async () => {
    process.env.NEXT_PUBLIC_COOKIEYES_ID = 'site-xyz'
    const { getCookieyesId } = await import('./ads')
    expect(getCookieyesId()).toBe('site-xyz')
  })

  it('getAdsenseClient trims whitespace and newlines', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = '  ca-pub-999\n'
    const { getAdsenseClient } = await import('./ads')
    expect(getAdsenseClient()).toBe('ca-pub-999')
  })

  it('getCookieyesId trims whitespace and newlines', async () => {
    process.env.NEXT_PUBLIC_COOKIEYES_ID = '\tsite-xyz\n'
    const { getCookieyesId } = await import('./ads')
    expect(getCookieyesId()).toBe('site-xyz')
  })

  it('treats whitespace-only values as undefined', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT = '   \n'
    const { getAdsenseClient, isAdsEnabled } = await import('./ads')
    expect(getAdsenseClient()).toBeUndefined()
    expect(isAdsEnabled()).toBe(false)
  })
})
