import { describe, it, expect, vi, beforeEach } from 'vitest'
import { debugLog, isDebugEnabled } from './debug'

describe('debug', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('isDebugEnabled returns true in development', () => {
    expect(isDebugEnabled()).toBe(true)
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
