import { describe, it, expect } from 'vitest'
import { calcFOV } from '@/lib/math/fov'
import { calcDoF } from '@/lib/math/dof'
import { calcEV, shutterWithNd } from '@/lib/math/exposure'
import { rule500 } from '@/lib/math/startrail'
import { kelvinToRgb, complementary } from '@/lib/math/color'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { TOOLS, getToolBySlug, getLiveTools } from '@/lib/data/tools'
import { GLOSSARY } from '@/lib/data/glossary'

describe('FOV calculations with real sensor data', () => {
  it('all sensors produce valid FOV at all focal lengths', () => {
    for (const sensor of SENSORS) {
      for (const fl of FOCAL_LENGTHS) {
        const fov = calcFOV(fl.value, sensor.cropFactor)
        expect(fov.horizontal).toBeGreaterThan(0)
        expect(fov.horizontal).toBeLessThan(180)
        expect(fov.vertical).toBeGreaterThan(0)
        expect(fov.vertical).toBeLessThan(fov.horizontal)
      }
    }
  })

  it('larger crop factor narrows FOV at same focal length', () => {
    const ff = calcFOV(50, 1.0)
    const apsc = calcFOV(50, 1.5)
    const m43 = calcFOV(50, 2.0)
    expect(ff.horizontal).toBeGreaterThan(apsc.horizontal)
    expect(apsc.horizontal).toBeGreaterThan(m43.horizontal)
  })
})

describe('DoF calculations with real sensor data', () => {
  it('all sensors produce valid DoF at common settings', () => {
    for (const sensor of SENSORS) {
      const coc = 0.03 / sensor.cropFactor
      const result = calcDoF({ focalLength: 50, aperture: 5.6, distance: 3, coc })
      expect(result.nearFocus).toBeGreaterThan(0)
      expect(result.nearFocus).toBeLessThan(3)
      expect(result.farFocus).toBeGreaterThan(3)
      expect(result.hyperfocal).toBeGreaterThan(0)
    }
  })
})

describe('Exposure math consistency', () => {
  it('EV is consistent across equivalent exposures', () => {
    const ev1 = calcEV(8, 1/125)    // f/8, 1/125s
    const ev2 = calcEV(5.6, 1/250)  // f/5.6, 1/250s - same EV
    expect(ev1).toBeCloseTo(ev2, 0)
  })

  it('ND filter doubles shutter speed per stop', () => {
    const base = 1/125
    const nd1 = shutterWithNd(base, 1)  // 1 stop
    const nd2 = shutterWithNd(base, 2)  // 2 stops
    expect(nd1).toBeCloseTo(base * 2, 6)
    expect(nd2).toBeCloseTo(base * 4, 6)
  })
})

describe('Star trail calculations with real sensor data', () => {
  it('wider lens allows longer exposure', () => {
    const wide = rule500(14, 1.0)
    const tele = rule500(200, 1.0)
    expect(wide).toBeGreaterThan(tele)
  })
})

describe('Tool registry integrity', () => {
  it('every tool has a unique slug', () => {
    const slugs = TOOLS.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('at least one tool is live', () => {
    expect(getLiveTools().length).toBeGreaterThan(0)
  })

  it('glossary relatedTool references resolve', () => {
    for (const term of GLOSSARY) {
      if (term.relatedTool) {
        expect(getToolBySlug(term.relatedTool)).toBeDefined()
      }
    }
  })
})

describe('Color temperature produces valid RGB', () => {
  it('daylight (6500K) is near-white', () => {
    const { r, g, b } = kelvinToRgb(6500)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeGreaterThan(200)
    expect(b).toBeGreaterThan(200)
  })

  it('complementary hues are 180 degrees apart', () => {
    const hues = complementary(90)
    expect(hues).toHaveLength(2)
    expect(Math.abs(hues[1] - hues[0])).toBeCloseTo(180, 0)
  })
})

describe('Sensor dimensions consistency', () => {
  it('sensor physical width correlates inversely with crop factor', () => {
    const ff = SENSORS.find(s => s.id === 'ff')!
    for (const sensor of SENSORS) {
      if (sensor.id === 'ff') continue
      if (sensor.cropFactor > 1) {
        expect(sensor.w!).toBeLessThan(ff.w!)
      } else if (sensor.cropFactor < 1) {
        expect(sensor.w!).toBeGreaterThan(ff.w!)
      }
    }
  })

  it('crop factor roughly equals 36/sensorWidth for landscape sensors', () => {
    // Full frame is 36mm wide, crop factor ~= 36/w (diagonal-based, so approximate)
    for (const sensor of SENSORS) {
      const approxCrop = 36 / sensor.w!
      // Allow generous tolerance since crop factor is diagonal-based, not width-based
      expect(sensor.cropFactor).toBeCloseTo(approxCrop, 0)
    }
  })
})

describe('ND filter math matches data', () => {
  it('ND filter stops produce correct shutter multiplication', () => {
    const base = 1 / 125
    // 3-stop ND should give 8x longer exposure
    const nd3 = shutterWithNd(base, 3)
    expect(nd3).toBeCloseTo(base * 8, 6)
    // 10-stop ND should give 1024x longer exposure
    const nd10 = shutterWithNd(base, 10)
    expect(nd10).toBeCloseTo(base * 1024, 6)
  })
})
