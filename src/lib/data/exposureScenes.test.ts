import { describe, it, expect } from 'vitest'
import { EXPOSURE_SCENES } from './exposureScenes'

describe('EXPOSURE_SCENES', () => {
  it('contains 4 scenes', () => {
    expect(EXPOSURE_SCENES).toHaveLength(4)
  })

  it('all have non-empty id and labelKey', () => {
    for (const s of EXPOSURE_SCENES) {
      expect(s.id).toBeTruthy()
      expect(s.labelKey).toBeTruthy()
    }
  })

  it('IDs are unique', () => {
    const ids = EXPOSURE_SCENES.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all have complete asset paths', () => {
    for (const s of EXPOSURE_SCENES) {
      expect(s.assets.photo).toMatch(/^\/images\//)
      expect(s.assets.depthMap).toMatch(/^\/images\//)
      expect(s.assets.motionMask).toMatch(/^\/images\//)
    }
  })

  it('asset paths reference the scene ID', () => {
    for (const s of EXPOSURE_SCENES) {
      expect(s.assets.photo).toContain(s.id)
      expect(s.assets.depthMap).toContain(s.id)
      expect(s.assets.motionMask).toContain(s.id)
    }
  })
})
