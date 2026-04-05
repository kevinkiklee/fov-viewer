import { describe, it, expect } from 'vitest'
import { DOF_SCENE_PRESETS } from './dofCalculator'

describe('DOF_SCENE_PRESETS', () => {
  it('contains 4 scene presets', () => {
    expect(DOF_SCENE_PRESETS).toHaveLength(4)
  })

  it('all have non-empty key and labelKey', () => {
    for (const p of DOF_SCENE_PRESETS) {
      expect(p.key).toBeTruthy()
      expect(p.labelKey).toBeTruthy()
    }
  })

  it('keys are unique', () => {
    const keys = DOF_SCENE_PRESETS.map(p => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('includes portrait, landscape, street, and macro', () => {
    const keys = DOF_SCENE_PRESETS.map(p => p.key)
    expect(keys).toContain('portrait')
    expect(keys).toContain('landscape')
    expect(keys).toContain('street')
    expect(keys).toContain('macro')
  })
})
