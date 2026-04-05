import { describe, it, expect } from 'vitest'
import { HYPERFOCAL_SCENE_PRESETS } from './hyperfocalSimulator'

describe('HYPERFOCAL_SCENE_PRESETS', () => {
  it('contains 2 presets', () => {
    expect(HYPERFOCAL_SCENE_PRESETS).toHaveLength(2)
  })

  it('all have non-empty key and tKey', () => {
    for (const p of HYPERFOCAL_SCENE_PRESETS) {
      expect(p.key).toBeTruthy()
      expect(p.tKey).toBeTruthy()
    }
  })

  it('keys are unique', () => {
    const keys = HYPERFOCAL_SCENE_PRESETS.map(p => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('includes landscape and street', () => {
    const keys = HYPERFOCAL_SCENE_PRESETS.map(p => p.key)
    expect(keys).toContain('landscape')
    expect(keys).toContain('street')
  })
})
