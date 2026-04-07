import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAnalyticsError, trackJsError, trackWebGLError, trackCapabilityCheck } from './error-tracking'

describe('error-tracking', () => {
  beforeEach(() => {
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
    expect(isAnalyticsError('https://eu.i.posthog.com/e')).toBe(true)
  })

  it('filters posthog path errors', () => {
    expect(isAnalyticsError('/phog/ingest/e')).toBe(true)
  })

  it('allows non-analytics errors', () => {
    expect(isAnalyticsError('https://www.phototools.io/api/contact')).toBe(false)
  })

  it('filters facebook errors', () => {
    expect(isAnalyticsError('https://connect.facebook.net/fbevents.js')).toBe(true)
  })
})
