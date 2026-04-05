import { describe, it, expect } from 'vitest'
import { DIST_PRESETS } from './perspectiveCompression'

describe('DIST_PRESETS', () => {
  it('contains 4 distance presets', () => {
    expect(DIST_PRESETS).toHaveLength(4)
  })

  it('all values are positive', () => {
    for (const d of DIST_PRESETS) {
      expect(d).toBeGreaterThan(0)
    }
  })

  it('is sorted ascending', () => {
    for (let i = 1; i < DIST_PRESETS.length; i++) {
      expect(DIST_PRESETS[i]).toBeGreaterThan(DIST_PRESETS[i - 1])
    }
  })
})
