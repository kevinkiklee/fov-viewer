import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPosthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  set_config: vi.fn(),
  startSessionRecording: vi.fn(),
  stopSessionRecording: vi.fn(),
}))
vi.mock('posthog-js', () => ({ default: mockPosthog }))

import { initPostHog, trackPostHog, upgradePostHog, downgradePostHog, resetPostHog } from './posthog'

describe('posthog provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '')
    resetPostHog()
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

  it('translates page_view to $pageview so PostHog dashboards populate', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test123')
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '/phog/ingest')
    initPostHog()
    trackPostHog('page_view', { page_path: '/en/fov-simulator', page_title: 'FOV Simulator' })
    expect(mockPosthog.capture).toHaveBeenCalledWith('$pageview', {
      page_path: '/en/fov-simulator',
      page_title: 'FOV Simulator',
    })
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
